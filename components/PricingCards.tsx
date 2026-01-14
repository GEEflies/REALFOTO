'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { useTranslations } from 'next-intl'

interface PricingTier {
    name: string
    price: number
    period: string
    description: string
    features: string[]
    images: number
    icon: typeof Sparkles
    popular?: boolean
    priceId?: string
}

interface PricingCardsProps {
    currentTier?: 'PAY_PER_IMAGE' | 'LIMITED_OFFER' | 'ENTERPRISE'
}

export function PricingCards({ currentTier = 'PAY_PER_IMAGE' }: PricingCardsProps) {
    const t = useTranslations('Pricing')
    const [loading, setLoading] = useState<string | null>(null)

    const tiers: PricingTier[] = [
        {
            name: t('payPerImage.name'),
            price: Number(t('payPerImage.price')),
            period: t('payPerImage.period'),
            description: t('payPerImage.desc'),
            features: [
                t('payPerImage.features.0'),
                t('payPerImage.features.1'),
                t('payPerImage.features.2'),
                t('payPerImage.features.3'),
            ],
            images: 0, // Depends on usage
            icon: Sparkles,
        },
        {
            name: t('limitedOffer.name'),
            price: Number(t('limitedOffer.price')),
            period: t('limitedOffer.period'),
            description: t('limitedOffer.desc'),
            features: [
                t('limitedOffer.features.0'),
                t('limitedOffer.features.1'),
                t('limitedOffer.features.2'),
                t('limitedOffer.features.3'),
                t('limitedOffer.features.4'),
            ],
            images: 50,
            icon: Zap,
            popular: true,
            priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
        },
        {
            name: t('enterprise.name'),
            price: Number(t('enterprise.price')),
            period: t('enterprise.period'),
            description: t('enterprise.desc'),
            features: [
                t('enterprise.features.0'),
                t('enterprise.features.1'),
                t('enterprise.features.2'),
                t('enterprise.features.3'),
                t('enterprise.features.4'),
                t('enterprise.features.5'),
            ],
            images: 200,
            icon: Crown,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        },
    ]

    const handleUpgrade = async (tier: PricingTier) => {
        if (!tier.priceId) return

        setLoading(tier.name)
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId: tier.priceId }),
            })

            const { url } = await response.json()
            if (url) {
                window.location.href = url
            }
        } catch (error) {
            console.error('Checkout error:', error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier, index) => {
                const Icon = tier.icon
                const isCurrentTier = tier.name.toUpperCase() === currentTier

                return (
                    <motion.div
                        key={tier.name}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card
                            className={cn(
                                'relative h-full flex flex-col transition-all duration-200 hover:shadow-lg',
                                tier.popular && 'border-blue-500 border-2 shadow-lg scale-105'
                            )}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-blue-600 text-white shadow-md">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="text-center pb-2">
                                <div
                                    className={cn(
                                        'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3',
                                        tier.popular
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-600'
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl">{tier.name}</CardTitle>
                                <CardDescription>{tier.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <div className="text-center mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        €{tier.price}
                                    </span>
                                    <span className="text-gray-500">/{tier.period}</span>
                                </div>

                                <ul className="space-y-3">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={tier.popular ? 'default' : 'outline'}
                                    size="lg"
                                    disabled={isCurrentTier || loading === tier.name}
                                    onClick={() => handleUpgrade(tier)}
                                >
                                    {loading === tier.name
                                        ? 'Loading...'
                                        : isCurrentTier
                                            ? 'Current Plan'
                                            : tier.price === 0
                                                ? 'Get Started'
                                                : 'Upgrade'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}
