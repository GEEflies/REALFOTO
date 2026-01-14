'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Check, Flame, X, Sparkles, Building2, Crown, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PaywallGateProps {
    open: boolean
    onClose?: () => void
}

type PricingTab = 'payPerImage' | 'limitedOffer' | 'enterprise'

export function PaywallGate({ open, onClose }: PaywallGateProps) {
    const t = useTranslations('Paywall')
    const [activeTab, setActiveTab] = useState<PricingTab>('payPerImage')

    if (!open) return null

    const handleClose = () => {
        if (onClose) onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with sophisticated blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Main Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header Section */}
                <div className="relative pt-12 pb-6 px-8 text-center bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                        <X className="w-6 h-6 text-gray-400 hover:text-gray-900" />
                    </button>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        {t('title')}
                    </h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>

                    {/* Premium Tab Switcher */}
                    <div className="flex justify-center mt-8">
                        <div className="inline-flex bg-gray-100/80 p-1.5 rounded-full border border-gray-200/50 backdrop-blur-sm">
                            {[
                                { id: 'payPerImage', label: t('tabs.payPerImage'), icon: Sparkles },
                                { id: 'limitedOffer', label: t('tabs.limitedOffer'), icon: Flame },
                                { id: 'enterprise', label: t('tabs.enterprise'), icon: Building2 }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as PricingTab)}
                                    className={cn(
                                        "relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 z-10",
                                        activeTab === tab.id
                                            ? "text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "text-blue-600")} />
                                        {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
                    <AnimatePresence mode="wait">
                        {activeTab === 'payPerImage' && (
                            <motion.div
                                key="payPerImage"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid lg:grid-cols-2 gap-12 items-center"
                            >
                                <div className="space-y-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
                                            <Zap className="w-4 h-4" />
                                            Flexible Usage
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 mb-4">{t('payPerImage.title')}</h3>
                                        <p className="text-gray-600 text-lg leading-relaxed">{t('payPerImage.description')}</p>
                                    </div>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-bold tracking-tight text-gray-900">€0.69</span>
                                        <span className="text-xl text-gray-500 font-medium">/ {t('payPerImage.perImage')}</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                    <Check className="w-5 h-5 text-green-600" />
                                                </div>
                                                <span className="font-medium text-gray-700">{t(`payPerImage.features.${i}`)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button size="lg" className="w-full h-14 text-lg bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                                        {t('getStarted')}
                                    </Button>

                                    <p className="text-center text-sm text-gray-400">
                                        {t('payPerImage.invoiceNote')}
                                    </p>
                                </div>

                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                                        <div className="aspect-[4/3] relative">
                                            <div className="absolute inset-0 flex">
                                                <div className="w-1/2 relative overflow-hidden border-r-2 border-white">
                                                    <div className="absolute top-4 left-4 z-10 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                                                        {t('before')}
                                                    </div>
                                                    <Image
                                                        src="/landing/pricing/before.jpeg"
                                                        alt="Before"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="w-1/2 relative overflow-hidden">
                                                    <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                        {t('after')}
                                                    </div>
                                                    <Image
                                                        src="/landing/pricing/after.jpeg"
                                                        alt="After"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'limitedOffer' && (
                            <motion.div
                                key="limitedOffer"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                            >
                                {[
                                    { count: 50, price: '16.99', per: '0.34', highlight: false, id: 'starter' },
                                    { count: 100, price: '24.99', per: '0.25', highlight: true, id: 'pro' }
                                ].map((plan) => (
                                    <div
                                        key={plan.count}
                                        className={cn(
                                            "relative p-8 rounded-3xl border-2 transition-all duration-300",
                                            plan.highlight
                                                ? "border-blue-500 bg-blue-50/30 shadow-xl scale-105 z-10"
                                                : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg"
                                        )}
                                    >
                                        {plan.highlight && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5">
                                                <Flame className="w-3.5 h-3.5 fill-current" />
                                                {t('limitedOffer.bestValue')}
                                            </div>
                                        )}

                                        <h3 className="text-lg font-medium text-gray-500 mb-2">
                                            {plan.count} {t('limitedOffer.images')}
                                        </h3>
                                        <div className="flex items-baseline gap-2 mb-6">
                                            <span className="text-5xl font-bold text-gray-900">€{plan.price}</span>
                                            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                                €{plan.per}/{t('payPerImage.perImage')}
                                            </span>
                                        </div>

                                        <Button
                                            className={cn(
                                                "w-full h-12 text-base mb-8 rounded-xl",
                                                plan.highlight ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-gray-800"
                                            )}
                                        >
                                            {t('selectPlan')}
                                        </Button>

                                        <div className="space-y-4">
                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Features</div>
                                            {[0, 1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                                                        plan.highlight ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                                                    )}>
                                                        <Check className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-gray-700 font-medium">{t(`limitedOffer.features.${i}`)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'enterprise' && (
                            <motion.div
                                key="enterprise"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-3xl mx-auto text-center"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-500/20">
                                    <Building2 className="w-10 h-10 text-white" />
                                </div>

                                <h3 className="text-4xl font-bold text-gray-900 mb-6 font-display">
                                    {t('enterprise.title')}
                                </h3>
                                <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                                    {t('enterprise.description')}
                                </p>

                                <div className="grid md:grid-cols-2 gap-6 mb-12">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm shrink-0">
                                                <Check className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <span className="font-semibold text-gray-900">{t(`enterprise.features.${i}`)}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button size="lg" className="px-12 h-14 text-lg bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all">
                                    {t('enterprise.contact')}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
