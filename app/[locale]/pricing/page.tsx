import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PricingCards } from '@/components/PricingCards'
import { useTranslations } from 'next-intl'
import { PreFooter } from '@/components/PreFooter'

export default function PricingPage() {
    const t = useTranslations('Pricing')

    return (
        <main className="min-h-screen bg-white">
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            {t('title')}
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                            {t('subtitle')}
                        </p>
                    </div>

                    <PricingCards />
                </div>
            </section>

            <PreFooter />
            <Footer />
        </main>
    )
}
