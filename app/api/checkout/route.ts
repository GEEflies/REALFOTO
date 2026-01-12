import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
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

        // TODO: Get user's Stripe customer ID from database
        // const user = await prisma.user.findUnique({
        //   where: { clerkId: userId },
        // })

        const session = await createCheckoutSession(
            null, // customerId - use user.stripeCustomerId in production
            priceId,
            userId
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
