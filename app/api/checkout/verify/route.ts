import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

/**
 * STRIPE SESSION VERIFICATION ENDPOINT
 * 
 * Verifies a real Stripe Checkout session and extracts tier/quota metadata
 * for the signup process
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('session_id')

        if (!sessionId) {
            return NextResponse.json(
                { valid: false, message: 'No session ID provided' },
                { status: 400 }
            )
        }

        // Retrieve the Stripe Checkout Session
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        // Check if payment was successful
        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { valid: false, message: 'Payment not completed' },
                { status: 400 }
            )
        }

        // Extract metadata
        const tier = session.metadata?.tier || 'starter'
        const tierName = session.metadata?.tierName || 'Starter'
        const imagesQuota = parseInt(session.metadata?.imagesQuota || '50')
        const priceInCents = session.amount_total || 0
        const price = priceInCents / 100 // Convert to euros

        return NextResponse.json({
            valid: true,
            tier,
            tierName,
            images: imagesQuota,
            price,
            sessionId: session.id,
            customerId: session.customer,
        })
    } catch (error) {
        console.error('Stripe session verification error:', error)
        return NextResponse.json(
            { valid: false, message: 'Failed to verify Stripe session' },
            { status: 500 }
        )
    }
}
