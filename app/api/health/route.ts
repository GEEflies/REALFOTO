import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        // 1. Check Database
        await prisma.$queryRaw`SELECT 1`
        const dbStatus = 'operational'

        // 2. Check API Configuration
        const replicateStatus = process.env.REPLICATE_API_TOKEN ? 'operational' : 'degraded'
        const stripeStatus = process.env.STRIPE_SECRET_KEY ? 'operational' : 'degraded'

        // Determine overall status
        const isHealthy = dbStatus === 'operational' && replicateStatus === 'operational'

        return NextResponse.json(
            {
                status: isHealthy ? 'operational' : 'degraded',
                services: {
                    database: dbStatus,
                    ai_engine: replicateStatus,
                    payments: stripeStatus,
                    website: 'operational' // Self-check
                },
                timestamp: new Date().toISOString()
            },
            { status: isHealthy ? 200 : 503 }
        )
    } catch (error) {
        console.error('Health check failed:', error)
        return NextResponse.json(
            {
                status: 'outage',
                services: {
                    database: 'outage',
                    ai_engine: 'unknown',
                    payments: 'unknown',
                    website: 'operational'
                },
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}
