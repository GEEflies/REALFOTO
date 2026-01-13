
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

if (!stripeSecretKey) {
    console.warn('Missing Stripe Secret Key');
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover', // Using the version typescript expects
    typescript: true,
});

export const getStripe = () => stripe

export const TIER_LIMITS = {
    FREE: 3,
    STARTER: 50,
    PRO: 200,
}

export async function createCheckoutSession(customerId: string | null, priceId: string, userId: string) {
    const checkoutSession: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        metadata: {
            userId: userId,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/enhance?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/#pricing`,
    }

    if (customerId) {
        checkoutSession.customer = customerId
    }

    return await stripe.checkout.sessions.create(checkoutSession)
}

