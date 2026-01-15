import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin
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
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json(
            { message: 'Missing signature or webhook config' },
            { status: 400 }
        )
    }

    let event: Stripe.Event

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2023-10-16', // Use the version matching your types or 'latest'
        })

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
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2023-10-16',
        })

        switch (event.type) {
            // Handle successful subscription renewal (Monthly reset)
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice

                // Only process subscription invoices
                if (!invoice.subscription) break

                // Retrieve subscription to get metadata
                const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

                // Try to get userId from subscription metadata, or fallback to customer metadata
                let userId = subscription.metadata?.userId

                if (!userId && invoice.customer) {
                    const customer = await stripe.customers.retrieve(invoice.customer as string)
                    if (!customer.deleted) {
                        userId = customer.metadata?.userId
                    }
                }

                if (userId) {
                    console.log(`Resetting usage for user ${userId} (Invoice Paid)`)
                    // Reset usage in users table
                    const { error } = await supabaseAdmin
                        .from('users')
                        .update({ images_used: 0, updated_at: new Date().toISOString() })
                        .eq('id', userId)

                    if (error) console.error('Failed to reset user usage:', error)
                } else {
                    console.log('No userId found for invoice payment', invoice.id)
                }
                break
            }

            // Handle cancelled subscription
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                let userId = subscription.metadata?.userId

                if (!userId && subscription.customer) {
                    const customer = await stripe.customers.retrieve(subscription.customer as string)
                    if (!customer.deleted) {
                        userId = customer.metadata?.userId
                    }
                }

                if (userId) {
                    console.log(`Downgrading user ${userId} to Starter (Subscription Deleted)`)

                    // Downgrade to starter
                    const { error } = await supabaseAdmin
                        .from('users')
                        .update({
                            tier: 'starter',
                            tier_name: 'Starter',
                            images_quota: 50, // Starter quota
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', userId)

                    // Also update auth metadata to match
                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        user_metadata: {
                            tier: 'starter',
                            tierName: 'Starter',
                            imagesQuota: 50
                        }
                    })

                    if (error) console.error('Failed to downgrade user:', error)
                }
                break
            }

            case 'checkout.session.completed': {
                // We handle signup separately (Payment -> Redirect -> Signup Form)
                // But we can log this for debugging
                const session = event.data.object as Stripe.Checkout.Session
                console.log('Checkout completed:', session.id)
                break
            }

            default:
            // console.log(`Unhandled event type: ${event.type}`)
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
