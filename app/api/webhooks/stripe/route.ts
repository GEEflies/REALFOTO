import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
        return NextResponse.json(
            { message: 'Missing stripe-signature header' },
            { status: 400 }
        )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json(
            { message: 'Webhook secret not configured' },
            { status: 500 }
        )
    }

    let event: Stripe.Event

    try {
        const stripe = getStripe()
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        console.error('Webhook signature verification failed:', error)
        return NextResponse.json(
            { message: 'Webhook signature verification failed' },
            { status: 400 }
        )
    }

    try {
        const stripe = getStripe()

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.userId
                const customerId = session.customer as string

                if (!userId) {
                    console.error('No userId in session metadata')
                    break
                }

                // Get subscription details
                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription as string
                )
                const priceId = subscription.items.data[0].price.id

                // Determine tier based on price ID
                let tier: 'STARTER' | 'PRO' = 'STARTER'
                if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
                    tier = 'PRO'
                }

                // TODO: Update user in database
                // await prisma.user.update({
                //   where: { clerkId: userId },
                //   data: {
                //     tier,
                //     stripeCustomerId: customerId,
                //     imagesUsed: 0, // Reset quota on upgrade
                //   },
                // })

                console.log(`User ${userId} upgraded to ${tier}`)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                // TODO: Downgrade user to free tier
                // await prisma.user.updateMany({
                //   where: { stripeCustomerId: customerId },
                //   data: {
                //     tier: 'FREE',
                //     imagesUsed: 0,
                //   },
                // })

                console.log(`Customer ${customerId} subscription cancelled`)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                console.error(`Payment failed for invoice ${invoice.id}`)
                // TODO: Send email notification to user
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json(
            { message: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}
