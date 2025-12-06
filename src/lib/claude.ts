// src/lib/claude.ts
import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Send a message to Claude and get a response
 * @param message - The user's message/prompt
 * @param systemPrompt - Optional system prompt to set Claude's behavior
 * @param model - The Claude model to use (default: 'claude-3-5-sonnet-20241022')
 * @returns The assistant's response text
 */
export async function askClaude(
  message: string,
  systemPrompt?: string,
  model: string = 'claude-3-5-sonnet-20241022'
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    })

    // Extract text from response
    const textContent = response.content.find(
      (block) => block.type === 'text'
    ) as { type: 'text'; text: string } | undefined

    return textContent?.text || 'No response generated'
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('Failed to get response from Claude')
  }
}

/**
 * Generate content using Claude (e.g., descriptions, summaries, etc.)
 * @param prompt - What you want Claude to generate
 * @param context - Optional context to help Claude understand the task
 * @returns Generated content
 */
export async function generateContent(
  prompt: string,
  context?: string
): Promise<string> {
  const fullPrompt = context
    ? `Context: ${context}\n\nTask: ${prompt}`
    : prompt

  return askClaude(
    fullPrompt,
    'You are a helpful assistant that generates high-quality content.'
  )
}

/**
 * Analyze or process text using Claude
 * @param text - The text to analyze
 * @param analysisType - What kind of analysis to perform
 * @returns Analysis result
 */
export async function analyzeText(
  text: string,
  analysisType: string = 'summarize'
): Promise<string> {
  const prompt = `Please ${analysisType} the following text:\n\n${text}`
  
  return askClaude(
    prompt,
    'You are a helpful assistant that provides clear, concise analysis.'
  )
}

/**
 * Claude API helper with custom configuration
 */
export const claudeAPI = {
  /**
   * Chat with Claude (conversation style)
   */
  async chat(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      })

      const textContent = response.content.find(
        (block) => block.type === 'text'
      ) as { type: 'text'; text: string } | undefined

      return textContent?.text || 'No response generated'
    } catch (error) {
      console.error('Claude API error:', error)
      throw error
    }
  },

  /**
   * Generate text with specific parameters
   */
  async generate(
    prompt: string,
    options?: {
      maxTokens?: number
      temperature?: number
      systemPrompt?: string
    }
  ) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 1,
        system: options?.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const textContent = response.content.find(
        (block) => block.type === 'text'
      ) as { type: 'text'; text: string } | undefined

      return textContent?.text || 'No response generated'
    } catch (error) {
      console.error('Claude API error:', error)
      throw error
    }
  },
}

