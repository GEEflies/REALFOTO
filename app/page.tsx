import Link from 'next/link'
import { Sparkles, Eraser, Zap, Shield, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PricingCards } from '@/components/PricingCards'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-yellow-50 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>AI-Powered Editing</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            AI Real Estate
            <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Photo Editor
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Enhance photos & remove objects in seconds. Transform ordinary listings into stunning, professional photography with the power of AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/enhance">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8">
                <Sparkles className="w-5 h-5" />
                Enhance Photo
              </Button>
            </Link>
            <Link href="/remove">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base px-8">
                <Eraser className="w-5 h-5" />
                Remove Object
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Results in 30 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>AI-Powered Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Results, Zero Effort
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI understands real estate photography and delivers stunning results every time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Enhance Feature */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Photo Enhancement
              </h3>
              <p className="text-gray-600 mb-4">
                Perfect HDR merge, bright window replacement, white balance correction, and professional lighting—all automatically.
              </p>
              <Link href="/enhance" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700">
                Try Enhancement
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Remove Feature */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <Eraser className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Object Removal
              </h3>
              <p className="text-gray-600 mb-4">
                Remove trash cans, power lines, cars, or any unwanted objects with seamless AI inpainting that matches the scene.
              </p>
              <Link href="/remove" className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700">
                Try Removal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                <span className="text-lg">🍌</span>
              </div>
              <span className="font-semibold text-white">Nana Banana Pro</span>
            </div>
            <p className="text-sm text-center md:text-right">
              © {new Date().getFullYear()} Nana Banana Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
