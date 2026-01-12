import { NextRequest, NextResponse } from 'next/server'
import { removeObject } from '@/lib/gemini'

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json()
        const { image, mimeType, objectToRemove } = body

        if (!image) {
            return NextResponse.json(
                { message: 'No image provided' },
                { status: 400 }
            )
        }

        if (!objectToRemove) {
            return NextResponse.json(
                { message: 'Please specify what to remove' },
                { status: 400 }
            )
        }

        // TODO: Check user quota from database
        // const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        // if (user.imagesUsed >= TIER_LIMITS[user.tier]) {
        //   return NextResponse.json({ message: 'Quota exceeded' }, { status: 403 })
        // }

        // Process image with Gemini
        const processedBase64 = await removeObject(
            image,
            objectToRemove,
            mimeType || 'image/jpeg'
        )

        // TODO: Increment user quota
        // await prisma.user.update({
        //   where: { clerkId: userId },
        //   data: { imagesUsed: { increment: 1 } }
        // })

        return NextResponse.json({
            processed: processedBase64,
            message: 'Object removed successfully',
        })
    } catch (error) {
        console.error('Remove API error:', error)
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Object removal failed' },
            { status: 500 }
        )
    }
}
