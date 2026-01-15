import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
        // Get authorization from header or cookie
        const authHeader = request.headers.get('authorization')
        let userId: string | null = null

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
            if (!error && user) {
                userId = user.id
            }
        }

        // Check for session cookie
        const cookies = request.headers.get('cookie')
        if (!userId && cookies) {
            const sessionMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/)
            if (sessionMatch) {
                try {
                    const sessionData = JSON.parse(decodeURIComponent(sessionMatch[1]))
                    if (sessionData?.[0]?.access_token) {
                        const { data: { user }, error } = await supabaseAdmin.auth.getUser(sessionData[0].access_token)
                        if (!error && user) {
                            userId = user.id
                        }
                    }
                } catch {
                    // Invalid session format
                }
            }
        }

        if (!userId) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Query public.users table
        let imagesQuota = 50
        let imagesUsed = 0

        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('images_quota, images_used')
                .eq('id', userId)
                .single()

            if (!error && data) {
                imagesQuota = data.images_quota
                imagesUsed = data.images_used
            } else {
                // Fallback to auth metadata if user record missing
                const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
                imagesQuota = user?.user_metadata?.imagesQuota || 50
                imagesUsed = user?.user_metadata?.imagesUsed || 0
            }
        } catch (e) {
            console.error('Error fetching stats:', e)
            // Fallback to auth metadata
            const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
            imagesQuota = user?.user_metadata?.imagesQuota || 50
            imagesUsed = user?.user_metadata?.imagesUsed || 0
        }

        // Estimate enhanced/removed based on total used
        const estimatedEnhanced = Math.floor(imagesUsed * 0.7)
        const estimatedRemoved = imagesUsed - estimatedEnhanced

        return NextResponse.json({
            imagesEnhanced: estimatedEnhanced,
            imagesRemoved: estimatedRemoved,
            imagesUsed: imagesUsed,
            imagesQuota: imagesQuota,
        })
    } catch (error) {
        console.error('Stats fetch error:', error)
        // Return default stats on error
        return NextResponse.json({
            imagesEnhanced: 0,
            imagesRemoved: 0,
            imagesUsed: 0,
            imagesQuota: 50,
        })
    }
}
