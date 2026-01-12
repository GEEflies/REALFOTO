import Stripe from 'stripe'

// Lazy initialization to avoid build-time errors when API key isn't available
let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
    if (!stripeClient) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not configured')
        }
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-12-15.clover',
            typescript: true,
        })
    }
    return stripeClient
}

// Export for backward compatibility
export const stripe = {
    get instance() {
        return getStripe()
    },
    webhooks: {
        constructEvent: (body: string, signature: string, secret: string) => {
            return getStripe().webhooks.constructEvent(body, signature, secret)
        }
    },
    customers: {
        create: (params: Stripe.CustomerCreateParams) => {
            return getStripe().customers.create(params)
        }
    },
    checkout: {
        sessions: {
            create: (params: Stripe.Checkout.SessionCreateParams) => {
                return getStripe().checkout.sessions.create(params)
            }
        }
    },
    subscriptions: {
        retrieve: (id: string) => {
            return getStripe().subscriptions.retrieve(id)
        }
    }
}

export const TIER_LIMITS = {
    FREE: 3,
    STARTER: 50,
    PRO: 200,
} as const

export const TIER_PRICES = {
    FREE: 0,
    STARTER: 25,
    PRO: 69,
} as const

export async function createCheckoutSession(
    customerId: string | null,
    priceId: string,
    userId: string
) {
    const session = await getStripe().checkout.sessions.create({
        customer: customerId || undefined,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
        metadata: {
            userId,
        },
    })

    return session
}

export async function createStripeCustomer(email: string, name?: string) {
    const customer = await getStripe().customers.create({
        email,
        name,
    })
    return customer
}
