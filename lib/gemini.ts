import { GoogleGenAI } from '@google/genai'

// Lazy initialization to avoid build-time errors when API key isn't available
let ai: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured')
        }
        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        })
    }
    return ai
}

const ENHANCE_PROMPT = `You are a professional real estate photo editor. Transform this real estate photo into a stunning, listing-ready image by applying ALL of the following enhancements:

## 1. HDR MERGING & EXPOSURE BALANCE
- Create perfect exposure balance across the ENTIRE image
- Recover ALL shadow details in dark areas - make them bright and visible
- Recover ALL highlight details in bright areas - no blown out whites
- Interior should be dramatically brighter while maintaining natural look

## 2. WINDOW PULLING (CRITICAL)
- Windows MUST show a clear, sharp view of the outside
- The exterior through windows should be perfectly visible, not white/blown out
- Balance interior exposure with exterior view - both must be crystal clear
- If there's sky visible through windows, it should be blue and inviting

## 3. SKY REPLACEMENT
- If any exterior sky is visible and it's dull/gray/overcast, replace with bright blue sky
- Add natural-looking white clouds for visual interest
- Sky should look inviting and enhance curb appeal

## 4. WHITE BALANCE CORRECTION
- Correct any color cast (yellow, blue, green tints)
- Whites should be pure white
- Create warm, inviting tones that feel welcoming
- Natural color temperature around 5500-6000K

## 5. PERSPECTIVE CORRECTION
- Straighten ALL vertical lines (walls, door frames, windows)
- Straighten ALL horizontal lines (floor edges, ceiling lines)
- Correct any lens distortion or barrel distortion
- Image should look professionally shot with a tilt-shift lens

## 6. IMAGE RELIGHTING
- Brighten ALL dark corners and shadowy areas dramatically
- Add subtle highlights to surfaces to create depth
- Create balanced, even lighting as if professionally lit
- No harsh shadows - soft, natural-looking illumination

## 7. RAW-QUALITY DETAIL ENHANCEMENT
- Maximize sharpness and clarity
- Enhance fine textures (wood grain, fabric, stone)
- Preserve and enhance all micro-details
- Output should look like it came from a professional camera RAW file

## 8. AUTO PRIVACY PROTECTION
- If there are any family photos/portraits visible, apply subtle blur
- If there are any license plates visible, blur them
- Blur any personal documents or screens with sensitive info
- Maintain natural appearance while protecting privacy

## 9. COLOR CORRECTION & VIBRANCE
- Boost color vibrance for visual pop without looking artificial
- Enhance greens in plants to look healthy and vibrant
- Enhance wood tones to look rich and warm
- Make the space look inviting, clean, and move-in ready

OUTPUT REQUIREMENTS:
- The result should be DRAMATICALLY improved - obvious visible difference
- Professional real estate listing quality
- Natural and realistic - not over-processed or HDR-heavy
- Ready for immediate use on Zillow, Redfin, Realtor.com

Apply ALL enhancements aggressively. The before/after difference should be STRIKING.`


const REMOVE_OBJECT_PROMPT = (objectToRemove: string) => `Edit this image by replacing the "${objectToRemove}" with the surrounding background (wall, floor, or ceiling). The result should look natural and seamless, as if the object was never there.`

export async function enhanceImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<string> {
    try {
        const client = getClient()
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-image',
            config: {
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ] as any,
            },
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: ENHANCE_PROMPT },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: imageBase64,
                            },
                        },
                    ],
                },
            ],
        })

        // Debug logging
        console.log('Gemini Enhance API Response:', JSON.stringify(response, null, 2))

        // Extract image from response
        const candidate = response.candidates?.[0]
        if (!candidate?.content?.parts) {
            console.error('No candidate or content in response:', {
                hasCandidates: !!response.candidates,
                candidatesLength: response.candidates?.length,
                firstCandidate: candidate,
            })
            throw new Error('No content in response')
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData?.data) {
                const mimeType = part.inlineData.mimeType || 'image/jpeg'
                console.log('Gemini response mimeType:', mimeType)
                return `data:${mimeType};base64,${part.inlineData.data}`
            }
            // Also check for text responses
            if (part.text) {
                console.log('Gemini returned text instead of image:', part.text)
            }
        }

        console.error('No image data found in parts:', candidate.content.parts)
        throw new Error('No image data in response')
    } catch (error) {
        console.error('Gemini enhance error:', error)
        throw error
    }
}

export async function removeObject(
    imageBase64: string,
    objectToRemove: string,
    mimeType: string = 'image/jpeg'
): Promise<string> {
    try {
        const client = getClient()
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-image',
            config: {
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ] as any,
            },
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: REMOVE_OBJECT_PROMPT(objectToRemove) },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: imageBase64,
                            },
                        },
                    ],
                },
            ],
        })

        // Debug logging
        console.log('Gemini Remove API Response:', JSON.stringify(response, null, 2))

        // Extract image from response
        const candidate = response.candidates?.[0]
        if (!candidate?.content?.parts) {
            console.error('No candidate or content in response:', {
                hasCandidates: !!response.candidates,
                candidatesLength: response.candidates?.length,
                firstCandidate: candidate,
            })
            throw new Error('No content in response')
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData?.data) {
                const mimeType = part.inlineData.mimeType || 'image/jpeg'
                return `data:${mimeType};base64,${part.inlineData.data}`
            }
            // Also check for text responses
            if (part.text) {
                console.log('Gemini returned text instead of image:', part.text)
            }
        }

        console.error('No image data found in parts:', candidate.content.parts)
        throw new Error('No image data in response')
    } catch (error) {
        console.error('Gemini remove object error:', error)
        throw error
    }
}
