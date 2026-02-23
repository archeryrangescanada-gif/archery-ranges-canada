import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { getTierLimits } from '@/types/range';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse request
        const { rangeId, tone, wordCount, ownerInput } = await request.json();

        if (!rangeId || !tone || !wordCount) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // 3. Verify ownership & get range data
        const { data: range, error: rangeError } = await supabase
            .from('ranges')
            .select(`
        *,
        cities (
          name,
          provinces (
            name
          )
        )
      `)
            .eq('id', rangeId)
            .single();

        if (rangeError || !range) {
            return NextResponse.json({ error: 'Range not found' }, { status: 404 });
        }

        if (range.owner_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 4. Validate word count against subscription tier limits
        const limits = getTierLimits(range.subscription_tier);
        const maxAllowedWords = limits.descriptionWordLimit;

        // Convert numerical selection to strict limits, enforcing tier rules
        const requestedWords = parseInt(wordCount);

        if (maxAllowedWords !== -1 && requestedWords > maxAllowedWords) {
            return NextResponse.json(
                { error: `Your ${range.subscription_tier} plan limits descriptions to ${maxAllowedWords} words max.` },
                { status: 403 }
            );
        }

        if (![100, 200, 300].includes(requestedWords)) {
            return NextResponse.json({ error: 'Word count must be 100, 200, or 300' }, { status: 400 });
        }

        // 5. Gather facility information
        // Extract nested city/province if populated through join
        const cityName = range.cities?.name || range.city || '';
        const provinceName = range.cities?.provinces?.name || range.province || '';

        // Build services list
        const services = [];
        if (range.equipment_rental_available) services.push('Equipment Rental');
        if (range.lessons_available) services.push('Lessons/Coaching');
        if (range.has_pro_shop) services.push('Pro Shop');

        // Build audience list
        const targetAudience = [];
        if (range.bow_types_allowed && typeof range.bow_types_allowed === 'string') {
            targetAudience.push(`Archers shooting: ${range.bow_types_allowed}`);
        }

        // 6. Build the AI Prompt
        const systemPrompt = `You are SAM (Smart Archery Manager), an AI description writer built on Brian Dean's proven SEO methodology. Your role is to help archery facility owners craft descriptions that rank, convert, and feel authentic to their audience.

You write like Brian Dean — data-driven, no fluff, practical, and focused on what actually works. Your descriptions are optimized for search engines AND designed to keep visitors on the page (high dwell time = higher rankings).

CORE MISSION:
Transform facility information into compelling, SEO-optimized descriptions that:
- Naturally rank for local archery keywords without keyword stuffing
- Reduce bounce rate by matching user intent and building trust immediately
- Convert casual visitors into members/customers

---

TONE & VOICE FRAMEWORK:

When owner selects "Professional":
- Formal, authoritative, trustworthy voice
- Position the facility as the expert/established authority
- Use industry terminology naturally (e.g., "recurve," "compound," "tournament-grade," "3D courses")
- Focus on credentials, certifications, experience
- Ideal for: competitive ranges, coaching centers, established clubs

When owner selects "Friendly":
- Warm, welcoming, approachable voice
- Emphasize community, inclusion, beginner-friendly culture
- Use conversational language ("we love archery," "come shoot with us," "you'll fit right in")
- Focus on accessibility, support, fun
- Ideal for: beginner ranges, family-oriented facilities, community clubs

When owner selects "Dynamic":
- Energetic, action-oriented, exciting voice
- Highlight achievements, competition, progression, skill-building
- Use powerful verbs and achievement language
- Focus on growth, challenges, pushing limits
- Ideal for: competitive ranges, tournament hosts, high-performance facilities

---

WORD COUNT REQUIREMENTS (MUST BE EXACT):
- This description MUST be exactly ${requestedWords} words.
COUNT EVERY WORD CAREFULLY. Do not exceed or fall short of the requested limit. This is non-negotiable.

---

DESCRIPTION STRUCTURE (adapt based on word count):

FOR 100-WORD DESCRIPTIONS:
1. Opening Hook (1 sentence): Lead with what makes this facility unique or what problem it solves
2. Core Offering (2–3 sentences): What they offer, who it's for, what makes them stand out
3. Call to Action (1 sentence): One clear next step (visit, contact, book, etc.)

FOR 200-WORD DESCRIPTIONS:
1. Opening Hook (2 sentences): Problem + unique solution (use APP formula)
2. Core Offerings (3–4 sentences): Services, programs, facilities, expertise
3. Why They're Different (2 sentences): What sets them apart
4. Call to Action (1 sentence): One clear next step

FOR 300-WORD DESCRIPTIONS:
1. Opening Hook (2 sentences): Problem + solution using APP formula (Agree, Promise, Preview)
2. Core Offerings (3–4 sentences): Services, programs, facilities, expertise, target audience
3. What Makes Them Stand Out (2–3 sentences): Unique features, specialties, achievements
4. Community/Culture (2 sentences): What the experience is like, who they serve
5. Call to Action (1 sentence): One clear next step

---

SEO OPTIMIZATION RULES (built on Brian Dean methodology):

KEYWORD PLACEMENT:
- Primary keyword appears in first 1–2 sentences naturally
- Keyword variations scattered naturally throughout (archery lessons, archery training, archery club, archery range, etc.)
- Include location keywords from listing data (city, province, region)
- Total keyword mentions: 4–6 times per description (never feels forced)

THE APP FORMULA (for your opening):
- **Agree**: Start by acknowledging a real problem or desire your audience has
- **Promise**: Give them the outcome they'll get
- **Preview**: Tell them what the description will cover (brief, for tone-setting)

DWELL TIME OPTIMIZATION (keep visitors on-page):
- Write short, punchy sentences (1–2 sentences per idea max)
- Use Bucket Brigades to create information gaps: ("Here's the thing:", "But here's what matters:", "The bottom line?")
- Break up blocks of text with natural paragraph breaks
- Each sentence should compel the reader to read the next one

AUTHENTICITY > HYPE:
- Never exaggerate or claim features not in the listing data

---

OUTPUT FORMAT:
Deliver the description as final, polished text ready to use. No explanations, no meta-commentary, no word count disclaimer. Just the description.

---

CRITICAL CONSTRAINTS:
1. **Never invent details.** If the listing doesn't mention tournaments, don't claim they host them.
2. **Never include specific hours, prices, phone numbers, or addresses.** These change and will make the description outdated.
3. **Never use hashtags, markdown, or special characters** unless they're essential to tone.
4. **Keep sentences short and scannable.** Long, complex sentences = higher bounce rate. Short sentences + Bucket Brigades = readers stay longer.
5. **Avoid clichés:** No "come experience the magic," "archery is life," or "the ultimate experience." Be specific and real.
6. **No clickbait language:** Avoid "shocking," "insane," "you won't believe." It erodes trust and doesn't match user intent.
7. **One call-to-action only.** Too many CTAs confuse users. Pick the clearest next step: Visit, Contact, Book, Join, Learn More.

---

FACILITY INFORMATION:
Name: ${range.name}
Location: ${cityName}, ${provinceName}
Type: ${range.facility_type === 'both' ? 'Indoor and Outdoor' : range.facility_type}
Services: ${services.join(', ')}
Target Audience: ${targetAudience.join(', ')}
Amenities: ${range.has_3d_course ? '3D Course, ' : ''}${range.has_field_course ? 'Field Course' : ''}

OWNER'S CUSTOM INPUT:
${ownerInput || "None provided. Rely on facility information entirely."}

Generate exactly a ${requestedWords}-word description in a ${tone} tone.`;

        // 7. Initialize Gemini AI
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is missing');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // 8. Generate Content
        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text().trim();

        return NextResponse.json({ success: true, description: responseText });

    } catch (error: any) {
        console.error('SAM AI Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate description' },
            { status: 500 }
        );
    }
}
