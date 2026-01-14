'use client'

import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useTranslations } from 'next-intl'
import { CheckCircle2, AlertCircle, Server } from 'lucide-react'

// Simulated uptime bar component
function UptimeBar({ days = 90 }: { days?: number }) {
    return (
        <div className="flex gap-[2px] h-8 mt-2 w-full">
            {Array.from({ length: days }).map((_, i) => (
                <div
                    key={i}
                    className="flex-1 bg-green-500 rounded-sm hover:opacity-80 transition-opacity"
                    title={`Day ${i + 1}: Operational`}
                />
            ))}
        </div>
    )
}

function StatusSection({ title, uptime }: { title: string; uptime: string }) {
    return (
        <div className="bg-white border rounded-lg p-6 mb-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{title}</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-green-600 font-medium text-sm">{uptime} uptime</span>
            </div>
            <UptimeBar />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>90 days ago</span>
                <span>Today</span>
            </div>
        </div>
    )
}

export default function StatusPage() {
    const t = useTranslations('Status')

    // In a real app, this would be determined by checking API health endpoints
    const allSystemsOperational = true

    return (
        <main className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6">

                {/* Header Status */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('allSystemsOperational')}</h1>
                    <p className="text-gray-500">
                        {t('lastUpdated', { date: new Date().toLocaleTimeString() })}
                    </p>
                </div>

                {/* Services Status */}
                <div className="space-y-6 mb-16">
                    <StatusSection title={t('services.website')} uptime="100.0%" />
                    <StatusSection title={t('services.webapp')} uptime="99.9%" />
                    <StatusSection title={t('services.api')} uptime="100.0%" />
                </div>

                {/* Incident History */}
                <div>
                    <h2 className="text-2xl font-semibold mb-6">{t('incidents.title')}</h2>
                    <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                        {t('incidents.empty')}
                    </div>
                </div>

            </div>
            <Footer />
        </main>
    )
}
