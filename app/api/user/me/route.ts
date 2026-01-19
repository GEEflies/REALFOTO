import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

// Server-side Supabase client
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

export async function GET(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization')
        let userId: string | null = null

        // Create a Supabase client configured to use cookies (Robust Auth)
        const cookieStore = request.cookies
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set({ name, value, ...options })
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )

        // Get user from Supabase Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (!authError && user) {
            userId = user.id
        }

        // Fallback: Check Authorization header if cookie auth failed
        if (!userId && authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const { data: { user: tokenUser }, error: tokenError } = await supabaseAdmin.auth.getUser(token)
            if (!tokenError && tokenUser) {
                userId = tokenUser.id
            }
        }

        if (!userId) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // query public.users table for up-to-date data
        let userData = null

        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (!error && data) {
                userData = data
            }
        } catch (e) {
            console.error('Error fetching from users table:', e)
        }

        // Get user from Supabase Auth as fallback/base
        const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.admin.getUserById(userId)

        if (error || !supabaseUser) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        // Use users table data if available, otherwise fallback to metadata
        const tier = userData?.tier || supabaseUser.user_metadata?.tier || 'starter'
        const tierName = userData?.tier_name || supabaseUser.user_metadata?.tierName || 'Starter'
        const imagesQuota = userData?.images_quota || supabaseUser.user_metadata?.imagesQuota || 50
        const imagesUsed = userData?.images_used || supabaseUser.user_metadata?.imagesUsed || 0
        const subscriptionStatus = userData?.subscription_status || supabaseUser.user_metadata?.subscriptionStatus || 'active'
        const hasStripeCustomer = !!(userData?.stripe_customer_id)

        return NextResponse.json({
            id: supabaseUser.id,
            email: supabaseUser.email,
            emailVerified: !!supabaseUser.email_confirmed_at,
            tier: tier,
            tierName: tierName,
            imagesUsed: imagesUsed,
            imagesQuota: imagesQuota,
            subscriptionStatus: subscriptionStatus,
            hasStripeCustomer: hasStripeCustomer,
            createdAt: supabaseUser.created_at,
        })
    } catch (error) {
        console.error('User fetch error:', error)
        return NextResponse.json(
            { message: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}
