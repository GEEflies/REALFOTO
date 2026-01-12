import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { increment = 1 } = body

        // TODO: Update in database
        // const user = await prisma.user.update({
        //   where: { clerkId: userId },
        //   data: { imagesUsed: { increment } },
        // })

        return NextResponse.json({
            message: 'Usage updated',
            increment,
        })
    } catch (error) {
        console.error('Usage API error:', error)
        return NextResponse.json(
            { message: 'Failed to update usage' },
            { status: 500 }
        )
    }
}
