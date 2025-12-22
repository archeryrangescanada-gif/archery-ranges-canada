require('dotenv').config({ path: '.env.local' })
const { GoogleGenerativeAI } = require('@google/generative-ai')

console.log('=== GEMINI SDK DEBUG SCRIPT ===\n')

// Check if API key is loaded
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY not found in environment')
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')))
  process.exit(1)
}

console.log('✅ API Key loaded:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 4))
console.log('✅ API Key length:', apiKey.length, 'characters\n')

// Initialize the SDK
const genAI = new GoogleGenerativeAI(apiKey)
console.log('✅ GoogleGenerativeAI instance created\n')

async function listAvailableModels() {
  try {
    console.log('📋 Fetching list of available models...\n')

    // Try to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )

    if (!response.ok) {
      console.error('❌ Failed to list models:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      return
    }

    const data = await response.json()

    if (!data.models || data.models.length === 0) {
      console.log('⚠️  No models available for this API key')
      console.log('This might mean:')
      console.log('1. API key is restricted or invalid')
      console.log('2. Gemini API is not enabled for your project')
      console.log('\nVisit https://aistudio.google.com/app/apikey to check your API key')
      return
    }

    console.log(`✅ Found ${data.models.length} available models:\n`)

    const generateContentModels = []
    data.models.forEach((model, index) => {
      const modelId = model.name.replace('models/', '')
      const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent')

      console.log(`${index + 1}. ${modelId}`)
      console.log(`   Display Name: ${model.displayName || 'N/A'}`)
      console.log(`   Supports generateContent: ${supportsGenerate ? '✅ YES' : '❌ NO'}`)
      console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`)
      console.log('')

      if (supportsGenerate) {
        generateContentModels.push(modelId)
      }
    })

    if (generateContentModels.length > 0) {
      console.log('\n🎯 RECOMMENDED MODELS for generateContent:')
      generateContentModels.forEach(m => console.log(`   - ${m}`))

      // Test the first available model
      console.log(`\n🧪 Testing first available model: ${generateContentModels[0]}`)
      await testModel(generateContentModels[0])
    } else {
      console.log('\n❌ No models support generateContent method')
      console.log('Your API key may not have access to Gemini generative models')
    }

  } catch (error) {
    console.error('❌ Error listing models:', error.message)
    console.error(error)
  }
}

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName })
    const result = await model.generateContent('Say "Hello" in one word')
    const response = await result.response
    const text = response.text()

    console.log(`✅ SUCCESS with "${modelName}"`)
    console.log(`   Response: ${text}\n`)
    console.log(`\n🎉 USE THIS MODEL IN YOUR CODE: "${modelName}"`)
    return true
  } catch (error) {
    console.log(`❌ FAILED with "${modelName}"`)
    console.log(`   Error: ${error.message}\n`)
    return false
  }
}

listAvailableModels().catch(console.error)
