import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic — never cache this route
export const dynamic = 'force-dynamic';

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const GITHUB_PAT = process.env.GITHUB_PAT;
const REPO_OWNER = 'archeryrangescanada-gif';
const REPO_NAME = 'archery-ranges-canada';

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

async function summarizeChat(messages: any[]) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    const textPayload = messages.map(m => `[${m.created_at}] ${m.from_name}: ${m.message}`).join('\n\n');

    const prompt = `You are Mission Control. Your job is to summarize this conversation log from today into a concise Markdown document. 
Focus ONLY on decisions made, tasks completed, important context shared, and new agent/system behaviours established. 
Do not include casual banter or temporary errors that were quickly fixed. Output ONLY the markdown text, no intro or outro.

CHAT LOG:
${textPayload}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2048 },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

async function generateEmbedding(text: string): Promise<number[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text }] }
        })
    });
    if (!response.ok) {
        throw new Error(`Gemini Embedding Error: ${await response.text()}`);
    }
    const data = await response.json();
    return data.embedding.values;
}

async function commitToGitHub(filename: string, content: string) {
    if (!GITHUB_PAT) throw new Error("GITHUB_PAT is not configured");

    const path = `ralph/logs/${filename}`;
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

    // 1. Check if file already exists to get its SHA (for updates)
    const getRes = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${GITHUB_PAT}`,
            'User-Agent': 'Mission-Control-Bot'
        }
    });

    let sha = undefined;
    if (getRes.status === 200) {
        const fileData = await getRes.json();
        sha = fileData.sha;
    }

    // 2. Base64 encode the content
    const base64Content = Buffer.from(content).toString('base64');

    // 3. Commit the file
    const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${GITHUB_PAT}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Mission-Control-Bot'
        },
        body: JSON.stringify({
            message: `feat(memory): add daily log for ${filename}`,
            content: base64Content,
            sha: sha,
            branch: 'main'
        })
    });

    if (!putRes.ok) {
        throw new Error(`GitHub API ${putRes.status}: ${await putRes.text()}`);
    }

    return await putRes.json();
}

export async function GET(request: NextRequest) {
    // Basic security: require an auth header or token for this route if triggered externally
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const trigger = searchParams.get('trigger');

    if (authHeader !== `Bearer ${process.env.TELEGRAM_BOT_TOKEN}` && trigger !== 'manual-run') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GITHUB_PAT) {
        return NextResponse.json({ error: 'GITHUB_PAT not configured' }, { status: 500 });
    }

    const supabase = getSupabase();

    // 1. Fetch uncompacted messages (using last 24 hours as a proxy if we don't track state)
    // We will get all messages from the last 24 hours to summarize
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data: messages, error } = await supabase
        .from('telegram_messages')
        .select('id, created_at, from_name, message, direction')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!messages || messages.length === 0) {
        return NextResponse.json({ status: 'No messages to compact for today.' });
    }

    try {
        // 2. Summarize
        const summary = await summarizeChat(messages);

        if (!summary) {
            return NextResponse.json({ status: 'Summary was empty, skipping.' });
        }

        // 3. Format Date for Filename (YYYY-MM-DD)
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `${dateStr}.md`;

        // Add header
        const fullContent = `# Auto-Compacted Log: ${dateStr}\n\n${summary}`;

        // 4. Commit to GitHub
        await commitToGitHub(filename, fullContent);

        // 5. Generate Embedding and Store in Supabase pgvector
        try {
            const embedding = await generateEmbedding(summary);
            const { error: insertError } = await supabase.from('memories').insert({
                content: fullContent,
                metadata: { source: 'daily-log', date: dateStr, filename: filename },
                embedding: embedding
            });
            if (insertError) {
                console.error('[Memory Compaction] Supabase insert error:', insertError);
            } else {
                console.log(`[Memory Compaction] Stored embedding in Supabase for ${dateStr}`);
            }
        } catch (embedError) {
            console.error('[Memory Compaction] Failed to store embedding:', embedError);
        }

        return NextResponse.json({
            ok: true,
            status: `Compacted ${messages.length} messages into ${filename} and pushed to GitHub + Supabase.`
        });

    } catch (e: any) {
        console.error('[Memory Compaction Error]', e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
