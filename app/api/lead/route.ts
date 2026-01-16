
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()
        const ip = req.headers.get('x-forwarded-for') || 'unknown'

        if (!email) {
            return NextResponse.json({ message: 'Email required' }, { status: 400 })
        }

        // Check if email already exists (double-check before insert)
        const { data: existingUser } = await db
            .from('leads')
            .select('id')
            .eq('email', email)
            .maybeSingle() // Use maybeSingle instead of single to avoid error when no match

        if (existingUser) {
            return NextResponse.json({ message: 'Email already exists' }, { status: 409 })
        }

        // Upsert lead: if IP exists, update email; if not, insert new
        // Note: The unique constraint is on IP for same-device tracking
        // But email also has unique constraint at database level
        const { error } = await db
            .from('leads')
            .upsert({
                ip,
                email,
                // Don't reset usage_count on re-registration of same IP
            }, { onConflict: 'ip' })
            .select()

        if (error) {
            // Check if it's a unique constraint violation on email (Postgres error code 23505)
            if (error.code === '23505' && error.message.includes('email')) {
                return NextResponse.json({ message: 'Email already exists' }, { status: 409 })
            }
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Lead registration error:', error)

        // Handle unique constraint violation at catch level too
        if (error.code === '23505' && error.message?.includes('email')) {
            return NextResponse.json({ message: 'Email already exists' }, { status: 409 })
        }

        return NextResponse.json({ message: 'Failed to register' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown'

        const { data, error } = await db
            .from('leads')
            .select('email, usage_count, is_pro')
            .eq('ip', ip)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            throw error
        }

        // If no record, they haven't registered email yet -> usage 0, not pro
        if (!data) {
            return NextResponse.json({
                hasEmail: false,
                usageCount: 0,
                isPro: false
            })
        }

        return NextResponse.json({
            hasEmail: !!data.email,
            usageCount: data.usage_count,
            isPro: data.is_pro
        })
    } catch (error) {
        console.error('Usage check error:', error)
        return NextResponse.json({ message: 'Failed to check usage' }, { status: 500 })
    }
}
