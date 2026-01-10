import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check database
    const supabase = await createClient()
    const { error } = await supabase.from('ranges').select('id').limit(1)

    if (error) {
      logger.error('Health check failed:', error)
      return NextResponse.json(
        { status: 'unhealthy', error: 'Database connection failed' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    })
  } catch (error) {
    logger.error('Health check exception:', error)
    return NextResponse.json(
      { status: 'unhealthy', error: String(error) },
      { status: 503 }
    )
  }
}
