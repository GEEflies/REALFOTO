
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

// Pricing tier configuration for Stripe metadata
export const TIER_CONFIG = {
    starter: { images: 50, tierName: 'Starter' },
    pro_100: { images: 100, tierName: 'Pro 100' },
    pro_200: { images: 200, tierName: 'Pro 200' },
    pro_300: { images: 300, tierName: 'Pro 300' },
    pro_400: { images: 400, tierName: 'Pro 400' },
    pro_500: { images: 500, tierName: 'Pro 500' },
    pro_1000: { images: 1000, tierName: 'Pro 1000' },
    pay_per_image: { images: 1, tierName: 'Pay Per Image' },
} as const

export async function createCheckoutSession(
    customerId: string | null,
    priceId: string,
    userId: string,
    tierKey?: string, // Optional tier identifier for metadata
    returnUrl?: string // Optional return URL for cancel button
) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aurix.pics'

    // Get tier config if provided
    const tierConfig = tierKey && tierKey in TIER_CONFIG
        ? TIER_CONFIG[tierKey as keyof typeof TIER_CONFIG]
        : null

    // Determine cancel URL - use provided returnUrl or default to pricing
    const cancelUrl = returnUrl || `${baseUrl}/#pricing`

    const checkoutSession: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        allow_promotion_codes: true, // Enable promo/coupon codes
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        metadata: {
            userId: userId,
            ...(tierConfig && {
                tier: tierKey!,
                tierName: tierConfig.tierName,
                imagesQuota: tierConfig.images.toString(),
            }),
        },
        // Redirect to success page with session_id for verification
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
    }

    if (customerId) {
        checkoutSession.customer = customerId
    }

    return await stripe.checkout.sessions.create(checkoutSession)
}

