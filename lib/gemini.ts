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

const ENHANCE_PROMPT = `Using the provided real estate photo, enhance it for a professional listing. Improve the lighting with perfect HDR balance, correct the white balance for natural warm tones, and enhance colors to be vibrant but realistic. The result should be ultra high quality and listing-ready.`

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
