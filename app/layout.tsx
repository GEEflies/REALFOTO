import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nana Banana Pro | AI Real Estate Photo Editor',
  description: 'Enhance photos & remove objects in seconds with AI-powered real estate photo editing.',
  keywords: ['real estate', 'photo editing', 'AI', 'HDR', 'property photos'],
  authors: [{ name: 'Nana Banana Pro' }],
  openGraph: {
    title: 'Nana Banana Pro | AI Real Estate Photo Editor',
    description: 'Enhance photos & remove objects in seconds with AI-powered real estate photo editing.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
          <Toaster
            position="top-right"
            richColors
            closeButton
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
