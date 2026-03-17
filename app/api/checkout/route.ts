import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createCheckoutSession } from '@/lib/stripe'

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
                { message: 'Unauthorized. Please sign in.' },
                { status: 401 }
            )
        }

        const token = authHeader.substring(7)
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return NextResponse.json(
                { message: 'Unauthorized. Please sign in.' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { priceId } = body

        if (!priceId) {
            return NextResponse.json(
                { message: 'Price ID is required' },
                { status: 400 }
            )
        }

        // Get user's Stripe customer ID from database
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        const session = await createCheckoutSession(
            userData?.stripe_customer_id || null,
            priceId,
            user.id
        )

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Checkout API error:', error)
        return NextResponse.json(
            { message: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
