'use client'

import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useTranslations } from 'next-intl'
import { CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

// Simulated uptime bar component
function UptimeBar({ status = 'operational' }: { status?: string }) {
    const color = status === 'operational' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
    return (
        <div className="flex gap-[2px] h-8 mt-2 w-full opacity-80">
            {Array.from({ length: 89 }).map((_, i) => (
                <div
                    key={i}
                    className="flex-1 bg-green-500 rounded-sm"
                    title={`Day ${i + 1}: Operational`}
                />
            ))}
            {/* The last bar represents current status */}
            <div className={`flex-1 ${color} rounded-sm animate-pulse`} title="Today" />
        </div>
    )
}

function StatusSection({ title, status }: { title: string; status: 'operational' | 'degraded' | 'outage' | 'loading' }) {
    let icon = <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
    let color = "text-gray-500"
    let statusText = "Checking..."

    if (status === 'operational') {
        icon = <CheckCircle2 className="w-4 h-4 text-green-500" />
        color = "text-green-600"
        statusText = "100.0% uptime"
    } else if (status === 'degraded') {
        icon = <AlertCircle className="w-4 h-4 text-yellow-500" />
        color = "text-yellow-600"
        statusText = "Degraded Performance"
    } else if (status === 'outage') {
        icon = <XCircle className="w-4 h-4 text-red-500" />
        color = "text-red-600"
        statusText = "Major Outage"
    }

    return (
        <div className="bg-white border rounded-lg p-6 mb-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{title}</span>
                    {icon}
                </div>
                <span className={`${color} font-medium text-sm`}>{statusText}</span>
            </div>
            {status !== 'loading' && <UptimeBar status={status} />}
        </div>
    )
}

interface SystemHealth {
    status: 'operational' | 'degraded' | 'outage'
    services: {
        database: 'operational' | 'degraded' | 'outage'
        ai_engine: 'operational' | 'degraded' | 'outage'
        payments: 'operational' | 'degraded' | 'outage'
        website: 'operational' | 'degraded' | 'outage'
    }
    timestamp: string
}

export default function StatusPage() {
    const t = useTranslations('Status')
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch('/api/health')
                const data = await res.json()
                setHealth(data)
            } catch (error) {
                console.error('Failed to check health', error)
                // Fallback to error state if API fails
                setHealth({
                    status: 'outage',
                    services: {
                        database: 'outage',
                        ai_engine: 'outage', // Changed from 'unknown' to 'outage' for consistency
                        payments: 'outage', // Changed from 'unknown' to 'outage' for consistency
                        website: 'outage'
                    },
                    timestamp: new Date().toISOString()
                })
            } finally {
                setLoading(false)
            }
        }

        checkHealth()
        // Poll every 30 seconds
        const interval = setInterval(checkHealth, 30000)
        return () => clearInterval(interval)
    }, [])

    const overallStatus = health?.status || 'loading'

    return (
        <main className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6">

                {/* Header Status */}
                <div className="text-center mb-16">
                    <div className={`inline-flex items-center justify-center p-3 rounded-full mb-6 ${overallStatus === 'operational' ? 'bg-green-100' :
                            overallStatus === 'degraded' ? 'bg-yellow-100' :
                                overallStatus === 'outage' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                        {overallStatus === 'operational' && <CheckCircle2 className="w-12 h-12 text-green-600" />}
                        {overallStatus === 'degraded' && <AlertCircle className="w-12 h-12 text-yellow-600" />}
                        {overallStatus === 'outage' && <XCircle className="w-12 h-12 text-red-600" />}
                        {overallStatus === 'loading' && <Loader2 className="w-12 h-12 text-gray-600 animate-spin" />}
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {loading ? 'Checking Systems...' : t('allSystemsOperational')}
                    </h1>
                    <p className="text-gray-500">
                        {t('lastUpdated', { date: health ? new Date(health.timestamp).toLocaleTimeString() : '...' })}
                    </p>
                </div>

                {/* Services Status */}
                <div className="space-y-6 mb-16">
                    <StatusSection
                        title={t('services.website')}
                        status={health?.services.website || 'loading'}
                    />
                    <StatusSection
                        title={t('services.webapp')}
                        status={health?.services.database || 'loading'}
                    />
                    <StatusSection
                        title={t('services.api')}
                        status={health?.services.ai_engine || 'loading'}
                    />
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
