import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as cheerio from 'cheerio'

// TypeScript interface matching the exact database schema
interface ArcheryRangeData {
  post_title: string
  post_address: string
  post_city: string
  post_region: string
  post_country: string
  post_zip: string
  post_latitude: number | null
  post_longitude: number | null
  phone: string
  email: string
  website: string
  post_content: string
  post_tags: string
  business_hours: string
  post_images: string[]
  range_length_yards: number
  number_of_lanes: number
  facility_type: 'Indoor' | 'Outdoor' | 'Both'
  has_pro_shop: boolean
  has_3d_course: boolean
  has_field_course: boolean
  membership_required: boolean
  membership_price_adult: number
  drop_in_price: number
  equipment_rental_available: boolean
  lessons_available: boolean
  lesson_price_range: string
  bow_types_allowed: string
  accessibility: boolean
  parking_available: boolean
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: GEMINI_API_KEY not found' },
        { status: 500 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // ✅ VALIDATE URL
    let urlObj: URL
    try {
      urlObj = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // ✅ BLOCK INTERNAL/PRIVATE IPs
    const hostname = urlObj.hostname.toLowerCase()
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
    ]

    // Block localhost and private IP ranges
    if (
      blockedHosts.includes(hostname) ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.')
    ) {
      return NextResponse.json(
        { error: 'Cannot fetch from internal/private networks' },
        { status: 400 }
      )
    }

    // ✅ ONLY ALLOW HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP/HTTPS URLs are allowed' },
        { status: 400 }
      )
    }

    console.log(`🚀 START: Fetching HTML from: ${url}`)

    // ✅ ADD TIMEOUT with AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    let webResponse: Response
    try {
      webResponse = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'ArcheryRangesCanada-Bot/1.0',
        },
      })
      clearTimeout(timeoutId)
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - page took too long to respond' },
          { status: 504 }
        )
      }
      throw error
    }

    if (!webResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${webResponse.status} ${webResponse.statusText}` },
        { status: 400 }
      )
    }

    // ✅ CHECK CONTENT LENGTH
    const contentLength = webResponse.headers.get('content-length')
    const MAX_SIZE = 5_000_000 // 5MB

    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Page too large (max 5MB)' },
        { status: 413 }
      )
    }

    // ✅ STREAM WITH SIZE LIMIT
    const reader = webResponse.body?.getReader()
    if (!reader) {
      // Fallback for no reader support (e.g. some mocks), though usually fetch has it.
      // We will try text() but double check length.
      const text = await webResponse.text()
      if (text.length > MAX_SIZE) {
        return NextResponse.json(
            { error: 'Page too large (max 5MB)' },
            { status: 413 }
          )
      }
      // Re-wrap in simple object for downstream code to use
      // or just continue. The code below expects 'html' string.
      var html = text;
    } else {
        const chunks: Uint8Array[] = []
        let totalSize = 0

        try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            if (value) {
                totalSize += value.length
                if (totalSize > MAX_SIZE) {
                    reader.cancel()
                    return NextResponse.json(
                        { error: 'Page too large (max 5MB)' },
                        { status: 413 }
                    )
                }
                chunks.push(value)
            }
        }
        } finally {
            reader.releaseLock()
        }
        var html = new TextDecoder().decode(Buffer.concat(chunks))
    }

    console.log(`✅ HTML DOWNLOADED: ${html.length} characters`)
    console.log(`   First 200 chars: ${html.substring(0, 200)}...`)

    // Use cheerio to extract clean text content
    const $ = cheerio.load(html)

    // Remove script, style, and other non-content tags
    $('script, style, noscript, iframe, svg').remove()

    // Extract text content
    const bodyText = $('body').text()
    const cleanText = bodyText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim()

    console.log(`✅ SCRAPED: Found ${cleanText.length} characters of clean text`)
    if (cleanText.length === 0) {
      console.error('⚠️  WARNING: Scraper returned 0 characters - page may be blocked or empty')
    }
    console.log(`   First 300 chars of text: ${cleanText.substring(0, 300)}...`)

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    console.log('✅ GoogleGenerativeAI initialized')

    // Use Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    console.log('✅ Model created: gemini-2.5-flash')

    const prompt = `Extract archery range business information from this webpage HTML and return ONLY valid JSON (no markdown, no code blocks, no explanation).

CRITICAL: Return ONLY the JSON object. Do not wrap it in markdown code blocks.

Required JSON Schema (use these EXACT field names):
{
  "post_title": "Business Name (REQUIRED - extract from title, heading, or business name)",
  "post_address": "Full street address (if not found, use empty string '')",
  "post_city": "City name (if not found, use empty string '')",
  "post_region": "Province/State (if not found, use empty string '')",
  "post_country": "Country (default to 'Canada' for Canadian archery ranges)",
  "post_zip": "Postal/ZIP code (if not found, use empty string '')",
  "post_latitude": null (or number if GPS coordinates found),
  "post_longitude": null (or number if GPS coordinates found),
  "phone": "Phone number (if not found, use empty string '')",
  "email": "Email address (if not found, use empty string '')",
  "website": "${url}",
  "post_content": "Brief description or summary of the venue (2-3 sentences)",
  "post_tags": "Comma-separated tags like 'indoor range, pro shop, lessons' (if not found, use empty string '')",
  "business_hours": "Business hours as string (e.g., 'Mon-Fri 9am-5pm') or empty string ''",
  "post_images": [] (array of image URLs if found, otherwise empty array),
  "range_length_yards": 0 (extract yardage; if not found: Indoor=20, Outdoor=50, Both=50, Unknown=0),
  "number_of_lanes": 0 (extract number of lanes/targets; if not mentioned, estimate: Indoor=6, Outdoor=10, Unknown=0),
  "facility_type": "Indoor" | "Outdoor" | "Both" (REQUIRED - infer from context; if unclear, use "Indoor"),
  "has_pro_shop": false (true if mentions shop, retail, equipment sales),
  "has_3d_course": false (true if mentions 3D targets, 3D range, 3D archery),
  "has_field_course": false (true if mentions field course, outdoor field archery),
  "membership_required": false (true if website indicates membership is required),
  "membership_price_adult": 0 (extract annual membership fee as number; if not found or unclear, use 0),
  "drop_in_price": 0 (extract drop-in/daily rate as number; if not found, use 0),
  "equipment_rental_available": false (true if mentions rental, equipment rental, bow rental),
  "lessons_available": false (true if mentions lessons, coaching, instruction, classes),
  "lesson_price_range": "" (e.g., "$30-$50 per hour" or empty string if not found),
  "bow_types_allowed": "" (e.g., "Recurve, Compound, Traditional" or empty string if not specified),
  "accessibility": false (true if mentions wheelchair accessible, accessible facilities),
  "parking_available": false (true if mentions parking, free parking, parking lot)
}

Extraction Rules:
1. ALL fields must be present in the response
2. Use empty string "" for missing text fields (NOT null)
3. Use 0 for missing numeric fields
4. Use false for missing boolean fields
5. Use [] for missing arrays
6. Infer reasonable defaults when specific info isn't available
7. For prices: extract only the number (e.g., "$50/year" → 50)
8. For facility_type: Look for keywords like "indoor", "outdoor", "field", "3D", "lanes"
9. post_title is REQUIRED - extract from any heading, title, or business name found

Website Text Content:
${cleanText.substring(0, 15000)}`

    console.log('🤖 SENDING TO GEMINI...')

    // Call Gemini AI
    let result
    try {
      result = await model.generateContent(prompt)
    } catch (aiError: any) {
      console.error('❌ Gemini API Error:', aiError)
      return NextResponse.json(
        {
          error: `Gemini API Error: ${aiError.message || 'Unknown error'}`,
          details: aiError.toString()
        },
        { status: 500 }
      )
    }

    const responseText = result.response.text().trim()
    console.log('📦 GEMINI RESPONSE RECEIVED')

    // Safe JSON parsing
    let extractedData: ArcheryRangeData
    try {
      // Strategy 1: Direct JSON parse
      extractedData = JSON.parse(responseText)
    } catch (e1) {
      try {
        // Strategy 2: Extract from markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[1])
        } else {
          // Strategy 3: Find first { to last }
          const firstBrace = responseText.indexOf('{')
          const lastBrace = responseText.lastIndexOf('}')
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonStr = responseText.substring(firstBrace, lastBrace + 1)
            extractedData = JSON.parse(jsonStr)
          } else {
            throw new Error('No valid JSON found in response')
          }
        }
      } catch (e2) {
        console.error('❌ ALL PARSING STRATEGIES FAILED')
        return NextResponse.json(
          {
            error: 'Failed to parse AI response as JSON',
            rawResponse: responseText.substring(0, 500)
          },
          { status: 500 }
        )
      }
    }

    // Validate required fields
    if (!extractedData.post_title) {
      return NextResponse.json(
        { error: 'AI extraction failed: post_title is required but was not found' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: extractedData })

  } catch (error: any) {
    console.error('❌ AI Extract Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to extract data',
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}
