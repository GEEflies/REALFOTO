import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { getAbsoluteUrl } from '@/lib/utils'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { locale = 'en' } = body

        // Get user profile to find stripe_customer_id
        const { data: profile } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        if (!profile?.stripe_customer_id) {
            return new NextResponse("No subscription found", { status: 404 })
        }

        // Create Stripe Portal Session
        // Stripe supports specific locales. 'sk' is Slovak.
        // If the locale is not supported, Stripe defaults to English or the account default.
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.aurix.pics'}${locale === 'sk' ? '/sk' : ''}/dashboard/settings`,
            locale: locale === 'sk' ? 'sk' : 'en',
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error('[STRIPE_PORTAL]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
