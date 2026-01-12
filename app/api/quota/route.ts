import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { TIER_LIMITS } from '@/lib/stripe'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // TODO: Fetch from database
        // const user = await prisma.user.findUnique({
        //   where: { clerkId: userId },
        // })

        // Mock response - in production, fetch from database
        const mockUser = {
            tier: 'FREE' as const,
            imagesUsed: 1,
        }

        return NextResponse.json({
            tier: mockUser.tier,
            used: mockUser.imagesUsed,
            limit: TIER_LIMITS[mockUser.tier],
            remaining: TIER_LIMITS[mockUser.tier] - mockUser.imagesUsed,
        })
    } catch (error) {
        console.error('Quota API error:', error)
        return NextResponse.json(
            { message: 'Failed to fetch quota' },
            { status: 500 }
        )
    }
}
