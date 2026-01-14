import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useTranslations } from 'next-intl'

export default function BlogPage() {
    const t = useTranslations('Pages.blog')

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-gray-500">
                        {t('content')}
                    </p>
                </div>
            </section>
            <Footer />
        </main>
    )
}
