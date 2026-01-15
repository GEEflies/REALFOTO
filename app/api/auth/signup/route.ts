import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
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

// Decrypt session data (for simulated sessions)
function decryptSessionData(encrypted: string): object | null {
    try {
        const crypto = require('crypto')
        const ENCRYPTION_KEY = process.env.SESSION_ENCRYPTION_KEY || 'aurix-default-key-change-in-prod'
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            crypto.createHash('sha256').update(ENCRYPTION_KEY).digest(),
            Buffer.alloc(16, 0)
        )
        let decrypted = decipher.update(decodeURIComponent(encrypted), 'base64', 'utf8')
        decrypted += decipher.final('utf8')
        return JSON.parse(decrypted)
    } catch {
        return null
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, session, sessionId, tierData } = body

        // Validate inputs
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // Determine tier info from either simulated session, Stripe session, or pre-verified tierData
        let tier: string = 'starter'
        let tierName: string = 'Starter'
        let imagesQuota: number = 50
        let stripeSessionIdValue: string = ''

        // Priority 1: Use pre-verified tierData from the client (already verified via /api/checkout/verify)
        if (tierData && tierData.tier && tierData.images) {
            tier = tierData.tier
            tierName = tierData.tierName || 'Pro'
            imagesQuota = tierData.images
            stripeSessionIdValue = sessionId || ''
        }
        // Priority 2: Verify simulated session (development/testing)
        else if (session) {
            const sessionData = decryptSessionData(session) as {
                tier: string
                tierName: string
                images: number
                price: number
                sessionId: string
                expiresAt: string
                paymentStatus: string
            } | null

            if (!sessionData) {
                return NextResponse.json(
                    { message: 'Invalid payment session' },
                    { status: 400 }
                )
            }

            // Check session expiry
            if (new Date(sessionData.expiresAt) < new Date()) {
                return NextResponse.json(
                    { message: 'Payment session has expired' },
                    { status: 400 }
                )
            }

            // Check payment status
            if (sessionData.paymentStatus !== 'paid') {
                return NextResponse.json(
                    { message: 'Payment not completed' },
                    { status: 400 }
                )
            }

            tier = sessionData.tier
            tierName = sessionData.tierName
            imagesQuota = sessionData.images
            stripeSessionIdValue = sessionData.sessionId
        }
        // Priority 3: Check for Stripe session_id (already verified client-side via /api/checkout/verify)
        else if (sessionId) {
            // The client already verified this session via /api/checkout/verify
            // We trust the tierData that was passed
            // If no tierData, use defaults (should not happen in normal flow)
            stripeSessionIdValue = sessionId
        }
        // No valid session
        else {
            return NextResponse.json(
                { message: 'Payment session is required' },
                { status: 400 }
            )
        }

        // Create Supabase Auth user with tier/quota in metadata
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: false, // User needs to verify email
            user_metadata: {
                tier: tier,
                tierName: tierName,
                imagesQuota: imagesQuota,
                imagesUsed: 0,
                stripeSessionId: stripeSessionIdValue,
                paymentStatus: 'paid',
            },
        })

        if (authError) {
            console.error('Supabase auth error:', authError)

            // Handle specific errors
            if (authError.message.includes('already registered')) {
                return NextResponse.json(
                    { message: 'An account with this email already exists' },
                    { status: 409 }
                )
            }

            return NextResponse.json(
                { message: 'Failed to create account' },
                { status: 500 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { message: 'Failed to create user' },
                { status: 500 }
            )
        }

        // Send verification email using invite link
        try {
            await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.aurix.pics'}/verify-email`,
            })
        } catch (emailError) {
            console.error('Email verification error:', emailError)
            // Don't fail the request, user can request new verification email
        }

        return NextResponse.json({
            success: true,
            message: 'Account created successfully. Please check your email to verify.',
            userId: authData.user.id,
        })
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { message: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
