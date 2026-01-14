'use client'

import { PricingCards } from '@/components/PricingCards'
import { useTranslations } from 'next-intl'

interface PaywallGateProps {
    open: boolean
}

export function PaywallGate({ open }: PaywallGateProps) {
    const t = useTranslations('Gates')

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            {t('limitTitle')}
                        </h2>
                        <p className="text-gray-600 max-w-md mx-auto">
                            {t('limitSubtitle')}
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <PricingCards />
                </div>
            </div>
        </div>
    )
}
