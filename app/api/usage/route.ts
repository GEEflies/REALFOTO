import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { incrementUserUsage } from '@/lib/usage'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)

export async function POST(request: NextRequest) {
    try {
        // Authenticate via Bearer token (same pattern as enhance/remove routes)
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const token = authHeader.substring(7)
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { increment = 1 } = body

        await incrementUserUsage(supabaseAdmin, user.id)

        return NextResponse.json({
            message: 'Usage updated',
            increment,
        })
    } catch (error) {
        console.error('Usage API error:', error)
        return NextResponse.json(
            { message: 'Failed to update usage' },
            { status: 500 }
        )
    }
}
