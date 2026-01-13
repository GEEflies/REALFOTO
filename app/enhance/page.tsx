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
                    <p className="text-gray-600 max-w-xl mx-auto mb-8">
                        Upload a real estate photo and our AI will automatically apply professional-grade enhancements.
                    </p>

                    {/* Feature Showcase Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-9 gap-3 max-w-4xl mx-auto mb-8">
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                            <span className="text-2xl">🌅</span>
                            <span className="text-xs font-medium text-gray-700">HDR Merge</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100">
                            <span className="text-2xl">🪟</span>
                            <span className="text-xs font-medium text-gray-700">Window Pull</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100">
                            <span className="text-2xl">☁️</span>
                            <span className="text-xs font-medium text-gray-700">Sky Replace</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100">
                            <span className="text-2xl">⚖️</span>
                            <span className="text-xs font-medium text-gray-700">White Bal.</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                            <span className="text-2xl">📐</span>
                            <span className="text-xs font-medium text-gray-700">Perspective</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100">
                            <span className="text-2xl">💡</span>
                            <span className="text-xs font-medium text-gray-700">Relighting</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                            <span className="text-2xl">📷</span>
                            <span className="text-xs font-medium text-gray-700">RAW Quality</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                            <span className="text-2xl">🔒</span>
                            <span className="text-xs font-medium text-gray-700">Auto Privacy</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                            <span className="text-2xl">🎨</span>
                            <span className="text-xs font-medium text-gray-700">Color Fix</span>
                        </div>
                    </div>
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
