import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TIER_LIMITS } from '@/lib/stripe'

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

export async function GET(request: NextRequest) {
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

        const { data: userData, error } = await supabaseAdmin
            .from('users')
            .select('tier, images_used, images_quota')
            .eq('id', user.id)
            .single()

        if (error || !userData) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        const tier = userData.tier as keyof typeof TIER_LIMITS
        const limit = userData.images_quota || TIER_LIMITS[tier] || TIER_LIMITS.FREE

        return NextResponse.json({
            tier: userData.tier,
            used: userData.images_used,
            limit,
            remaining: limit - userData.images_used,
        })
    } catch (error) {
        console.error('Quota API error:', error)
        return NextResponse.json(
            { message: 'Failed to fetch quota' },
            { status: 500 }
        )
    }
}
