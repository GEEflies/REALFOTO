'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Loader2, Sparkles, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ImageDropzone } from '@/components/ImageDropzone'
import { BeforeAfter } from '@/components/BeforeAfter'
import { getBase64FromFile } from '@/lib/utils'

type ProcessingState = 'idle' | 'processing' | 'done' | 'error'

export default function EnhancePage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null)
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
    const [processingState, setProcessingState] = useState<ProcessingState>('idle')

    const handleImageSelect = async (file: File, preview: string) => {
        setOriginalImage(preview)
        setOriginalFile(file)
        setEnhancedImage(null)
        setProcessingState('idle')

        // Auto-process on upload
        await processImage(file)
    }

    const processImage = async (file: File) => {
        if (!file) return

        setProcessingState('processing')

        try {
            const base64 = await getBase64FromFile(file)

            const response = await fetch('/api/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64,
                    mimeType: file.type,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Enhancement failed')
            }

            const data = await response.json()
            setEnhancedImage(data.enhanced)
            setProcessingState('done')
            toast.success('Image enhanced successfully!')
        } catch (error) {
            console.error('Enhancement error:', error)
            setProcessingState('error')
            toast.error(error instanceof Error ? error.message : 'Enhancement failed. Please try again.')
        }
    }

    const handleDownload = () => {
        if (!enhancedImage) return

        try {
            console.log('Download start. Image starts with:', enhancedImage.substring(0, 50))

            // Force browser to treat it as a download by changing MIME type to octet-stream
            const base64Data = enhancedImage.split(',')[1]
            const mimeType = enhancedImage.split(',')[0].split(':')[1].split(';')[0]
            const ext = mimeType.includes('png') ? 'png' : 'jpg'
            const filename = `enhanced-image-${Date.now()}.${ext}`

            const link = document.createElement('a')
            link.href = `data:application/octet-stream;base64,${base64Data}`
            link.download = filename

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success('Image downloaded!')
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download image')
        }
    }

    const handleReset = () => {
        setOriginalImage(null)
        setOriginalFile(null)
        setEnhancedImage(null)
        setProcessingState('idle')
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Enhancement</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Enhance Your Photo
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Upload a real estate photo and our AI will automatically enhance it with perfect HDR, lighting, and professional quality.
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    <AnimatePresence mode="wait">
                        {processingState === 'done' && enhancedImage ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <BeforeAfter
                                    beforeImage={originalImage!}
                                    afterImage={enhancedImage}
                                />

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button onClick={handleDownload} size="lg" className="gap-2">
                                        <Download className="w-5 h-5" />
                                        Download Enhanced
                                    </Button>
                                    <Button onClick={handleReset} size="lg" variant="outline" className="gap-2">
                                        <RotateCcw className="w-5 h-5" />
                                        Enhance Another
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <ImageDropzone
                                    onImageSelect={handleImageSelect}
                                    disabled={processingState === 'processing'}
                                    currentPreview={originalImage}
                                    onClear={handleReset}
                                />

                                {/* Processing State */}
                                {processingState === 'processing' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 text-center"
                                    >
                                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-blue-50 text-blue-700">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="font-medium">Enhancing your image...</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            This usually takes 20-30 seconds
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
