'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, ExternalLink, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface HistoryItem {
    id: string
    created_at: string
    original_url: string | null
    enhanced_url: string | null
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
}

export function HistoryGrid({ initialImages }: { initialImages: HistoryItem[] }) {
    const [images, setImages] = useState<HistoryItem[]>(initialImages)

    const handleDownload = async (url: string | null, filename: string) => {
        if (!url) return

        try {
            // Handle Data URIs (Base64) separately to avoid "URL too long" errors
            if (url.startsWith('data:')) {
                const response = await fetch(url)
                const blob = await response.blob()
                const blobUrl = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = blobUrl
                link.download = filename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(blobUrl)
            } else {
                // Standard URL download (try to force download)
                const response = await fetch(url)
                const blob = await response.blob()
                const blobUrl = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = blobUrl
                link.download = filename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(blobUrl)
            }
            toast.success("Download started")
        } catch (e) {
            console.error(e)
            // Fallback: just open in new tab if fetch fails (e.g. CORS)
            window.open(url, '_blank')
        }
    }

    if (images.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No history found.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
                <div key={img.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative aspect-[4/3] bg-gray-100">
                        {img.enhanced_url ? (
                            <Image
                                src={img.enhanced_url}
                                alt="Enhanced"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                {img.status === 'FAILED' ? <AlertCircle /> : <div className="animate-pulse bg-gray-200 w-full h-full" />}
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            {img.enhanced_url && (
                                <button
                                    onClick={() => handleDownload(img.enhanced_url, `enhanced-${img.id}.jpg`)}
                                    className="bg-white text-gray-900 p-3 rounded-full hover:scale-110 transition-transform shadow-xl"
                                    title="Download Enhanced Image"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${img.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    img.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {img.status}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(img.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
