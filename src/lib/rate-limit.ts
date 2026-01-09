import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

/**
 * Basic in-memory rate limiter.
 * Note: In a serverless environment (Vercel), this state is not shared across lambda instances.
 * It provides basic protection against rapid-fire attacks on a single hot lambda, but not distributed DoS.
 * For production, use Upstash Redis or Vercel KV.
 *
 * @param identifier Unique identifier (e.g. IP address)
 * @param limit Max requests
 * @param windowMs Time window in milliseconds
 */
export async function rateLimit(identifier: string, limit = 10, windowMs = 60000) {
  // Prune old entries occasionally to prevent memory leak
  if (rateLimitMap.size > 10000) {
      rateLimitMap.clear()
  }

  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1, reset: now + windowMs }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetTime }
  }

  record.count++
  return { success: true, remaining: limit - record.count, reset: record.resetTime }
}

export function getClientIp() {
    const headerList = headers()
    const xForwardedFor = headerList.get('x-forwarded-for')
    if (xForwardedFor) {
        return xForwardedFor.split(',')[0].trim()
    }
    return 'unknown'
}
