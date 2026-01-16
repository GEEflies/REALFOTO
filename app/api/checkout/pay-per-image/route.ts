import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
    createPayPerImageSubscription,
    createPayPerImageCheckout,
} from '@/lib/stripe'

// Server-side Supabase client (Admin)
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

/**
 * PAY-PER-IMAGE CHECKOUT ENDPOINT
 * 
 * Handles two scenarios:
 * 1. Existing customer with stripe_customer_id → Creates metered subscription directly
 * 2. New user → Redirects to Stripe Checkout to collect card, then creates metered subscription
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { returnUrl } = body as { returnUrl?: string }

        // Try to get authenticated user (optional)
        const authHeader = request.headers.get('authorization')
        let userId: string | null = null
        let userData: any = null

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

            if (!authError && user) {
                userId = user.id

                // Get user's Stripe customer ID
                const { data, error: userError } = await supabaseAdmin
                    .from('users')
                    .select('stripe_customer_id, pay_per_image_enabled, pay_per_image_subscription_id')
                    .eq('id', user.id)
                    .single()

                if (!userError && data) {
                    userData = data
                }
            }
        }

        // Scenario 1: Authenticated user with existing subscription data
        if (userId && userData) {
            // Check if user already has pay-per-image enabled
            if (userData.pay_per_image_enabled && userData.pay_per_image_subscription_id) {
                return NextResponse.json({
                    success: true,
                    message: 'Pay-per-image is already enabled',
                    alreadyEnabled: true,
                })
            }

            // User has a Stripe customer ID - enable instantly
            if (userData.stripe_customer_id) {
                try {
                    const { subscriptionId, subscriptionItemId } = await createPayPerImageSubscription(
                        userData.stripe_customer_id,
                        userId
                    )

                    // Update user record
                    await supabaseAdmin
                        .from('users')
                        .update({
                            pay_per_image_enabled: true,
                            pay_per_image_subscription_id: subscriptionId,
                            pay_per_image_item_id: subscriptionItemId,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId)

                    return NextResponse.json({
                        success: true,
                        message: 'Pay-per-image enabled successfully',
                        subscriptionId,
                    })
                } catch (error) {
                    console.error('Error creating pay-per-image subscription:', error)
                    return NextResponse.json(
                        { message: 'Failed to enable pay-per-image' },
                        { status: 500 }
                    )
                }
            }
        }

        // Scenario 2: Non-authenticated user OR authenticated user without Stripe customer
        // Redirect to Stripe checkout (will collect payment details and create customer)
        try {
            const session = await createPayPerImageCheckout(userId || null, returnUrl)

            return NextResponse.json({
                success: true,
                url: session.url,
                sessionId: session.id,
                requiresCheckout: true,
            })
        } catch (error) {
            console.error('Error creating pay-per-image checkout:', error)
            return NextResponse.json(
                { message: 'Failed to create checkout session' },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Pay-per-image API error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
