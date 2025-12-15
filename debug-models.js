
const fs = require('fs');

// Mock Env
const envLocal = fs.readFileSync('.env.local', 'utf8');
const apiKey = envLocal.match(/GEMINI_API_KEY=(.*)/)[1].trim();

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            console.error('API Error:', data.error);
        } else {
            console.log('Available Models:');
            data.models.forEach(m => console.log(` - ${m.name}`));
        }
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

listModels();
