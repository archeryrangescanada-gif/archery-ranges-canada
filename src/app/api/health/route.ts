import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/api'

export const dynamic = 'force-dynamic'

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: {
      status: 'up' | 'down'
      responseTime?: number
      error?: string
    }
    api: {
      status: 'up'
      uptime: number
    }
  }
}

export async function GET() {
  const startTime = Date.now()

  let dbStatus: 'up' | 'down' = 'down'
  let dbResponseTime: number | undefined
  let dbError: string | undefined

  // Check database connection
  try {
    const dbStart = Date.now()
    const supabase = getSupabaseClient()

    // Simple query to test database connectivity
    const { error } = await supabase
      .from('ranges')
      .select('id')
      .limit(1)
      .single()

    dbResponseTime = Date.now() - dbStart

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
      dbStatus = 'down'
      dbError = error.message
    } else {
      dbStatus = 'up'
    }
  } catch (error: any) {
    dbStatus = 'down'
    dbError = error.message || 'Database connection failed'
  }

  // Determine overall health status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
  if (dbStatus === 'up') {
    overallStatus = 'healthy'
  } else {
    overallStatus = 'unhealthy'
  }

  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        error: dbError
      },
      api: {
        status: 'up',
        uptime: process.uptime()
      }
    }
  }

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === 'healthy' ? 200 : 503

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}
