
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Mock Env
const envLocal = fs.readFileSync('.env.local', 'utf8');
const apiKey = envLocal.match(/GEMINI_API_KEY=(.*)/)[1].trim();

console.log('API Key Found:', apiKey ? 'Yes (starts with ' + apiKey.substring(0, 4) + ')' : 'No');

async function testExtract(url) {
    console.log(`\nTesting URL: ${url}`);

    // 1. Fetch
    console.log('1. Fetching...');
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            redirect: 'follow'
        });

        console.log('   Status:', response.status);
        console.log('   Final URL:', response.url);

        const html = await response.text();
        console.log('   HTML Length:', html.length);

        // 2. Cheerio
        console.log('2. Parsing HTML...');
        const $ = cheerio.load(html);
        $('script, style, noscript, iframe, svg, header, footer').remove();
        const textContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);

        console.log('   Extracted Text Preview:', textContent.substring(0, 200) + '...');

        if (textContent.length < 50) {
            console.warn('   WARNING: Very little text extracted. This page might be JS-heavy or blocking bots.');
        }

        // 3. Check Models first
        /*
        console.log('3. Checking Models...');
        try {
             // The SDK doesn't have a direct listModels on the main class easily accessible in all versions.
             // Let's just try "gemini-1.5-flash-latest" or "gemini-pro" again with strict error catch.
             // Or better, just print the error details.
        } catch (e) {}
        */

        console.log('3. Sending to Gemini...');
        const genAI = new GoogleGenerativeAI(apiKey);
        // Try the stable "gemini-pro" again, maybe it was a transient error? 
        // Or "gemini-1.0-pro"
        // Using "gemini-flash-latest" as confirmed available in user's model list
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });


        const prompt = `
        Extract details from this text into JSON:
        ${textContent}
        Return JSON object with name, city, province, address, etc.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log('   Gemini Response:', responseText);

    } catch (err) {
        console.error('   ERROR:', err.message);
        if (err.cause) console.error('   Cause:', err.cause);
    }
}

// Test with a generic Google Maps link (since I can't copy exact one)
// and a real site known to work
(async () => {
    // Test 1: Real Website (Control)
    await testExtract('https://archerytoronto.ca');

    // Test 2: The specific user URL
    await testExtract('https://share.google/5HZF1DbfWIw1MJshf');
})();
