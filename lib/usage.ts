import { SupabaseClient } from '@supabase/supabase-js'

export async function incrementUserUsage(supabaseAdmin: SupabaseClient, userId: string): Promise<boolean> {
    try {
        // Try RPC first (Atomic & Efficient)
        const { error: rpcError } = await supabaseAdmin.rpc('increment_image_usage', { user_id: userId })

        if (!rpcError) {
            console.log(`✅ [Usage] Incremented usage for ${userId} via RPC`)
            return true
        }

        console.warn('[Usage] RPC failed, falling back to manual update:', rpcError)

        // Fallback: Manual Fetch + Update
        const { data: user, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('images_used')
            .eq('id', userId)
            .single()

        if (fetchError || !user) {
            console.error('[Usage] Failed to fetch user for manual update:', fetchError)
            return false
        }

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ images_used: (user.images_used || 0) + 1 })
            .eq('id', userId)

        if (updateError) {
            console.error('[Usage] Manual update failed:', updateError)
            return false
        }

        console.log(`✅ [Usage] Incremented usage for ${userId} via Manual Update`)
        return true

    } catch (error) {
        console.error('[Usage] Unexpected error incrementing usage:', error)
        return false
    }
}
