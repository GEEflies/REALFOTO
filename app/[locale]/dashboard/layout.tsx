'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    Eraser,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
    ChevronRight,
    User
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { supabaseAuth, signOut, getSession } from '@/lib/supabase-auth'
import { toast } from 'sonner'

interface DashboardLayoutProps {
    children: React.ReactNode
}

interface UserData {
    id: string
    email: string
    tier: string
    tierName: string
    imagesUsed: number
    imagesQuota: number
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const t = useTranslations('Dashboard')
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<UserData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const session = await getSession()

            if (!session) {
                // Not logged in - redirect to login
                router.push('/login')
                return
            }

            // Get user data from API
            const response = await fetch('/api/user/me')
            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                // Fallback to session metadata
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    tier: session.user.user_metadata?.tier || 'starter',
                    tierName: session.user.user_metadata?.tierName || 'Starter',
                    imagesUsed: 0,
                    imagesQuota: session.user.user_metadata?.imagesQuota || 50,
                })
            }
        } catch (error) {
            console.error('Auth check error:', error)
            router.push('/login')
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        const { error } = await signOut()
        if (error) {
            toast.error('Failed to log out')
        } else {
            toast.success('Logged out successfully')
            router.push('/')
        }
    }

    const navItems = [
        { href: '/dashboard', icon: Home, label: t('nav.home') },
        { href: '/dashboard/enhance', icon: Sparkles, label: t('nav.enhance') },
        { href: '/dashboard/remove', icon: Eraser, label: t('nav.remove') },
        { href: '/dashboard/settings', icon: Settings, label: t('nav.settings') },
    ]

    const isActive = (href: string) => {
        // Handle locale prefix
        const cleanPath = pathname.replace(/^\/(en|sk)/, '')
        return cleanPath === href || (href !== '/dashboard' && cleanPath.startsWith(href))
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/aurix-logo.png" alt="Aurix" width={36} height={36} className="rounded-lg" />
                        <span className="text-xl font-bold text-gray-900">Aurix</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.href)
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`} />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info & Quota */}
                <div className="p-4 border-t border-gray-100">
                    {/* Quota Progress */}
                    {user && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">{t('quota.title')}</span>
                                <span className="font-medium text-gray-900">
                                    {user.imagesUsed}/{user.imagesQuota}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (user.imagesUsed / user.imagesQuota) * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{user.tierName} Plan</p>
                        </div>
                    )}

                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.email || 'User'}
                            </p>
                            <p className="text-xs text-gray-500">{user?.tierName || 'Free'}</p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {t('nav.logout')}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/aurix-logo.png" alt="Aurix" width={32} height={32} className="rounded-lg" />
                    <span className="text-lg font-bold text-gray-900">Aurix</span>
                </Link>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    <Menu className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-50 bg-black/50"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-xl flex flex-col"
                        >
                            {/* Close Button */}
                            <div className="p-4 flex items-center justify-between border-b border-gray-100">
                                <Link href="/" className="flex items-center gap-2">
                                    <Image src="/aurix-logo.png" alt="Aurix" width={32} height={32} className="rounded-lg" />
                                    <span className="text-lg font-bold text-gray-900">Aurix</span>
                                </Link>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="flex-1 p-4">
                                <ul className="space-y-1">
                                    {navItems.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive(item.href)
                                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    {item.label}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Mobile User Info */}
                            <div className="p-4 border-t border-gray-100">
                                {user && (
                                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">{t('quota.title')}</span>
                                            <span className="font-medium text-gray-900">
                                                {user.imagesUsed}/{user.imagesQuota}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                                style={{ width: `${Math.min(100, (user.imagesUsed / user.imagesQuota) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                    {t('nav.logout')}
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                <div className="pt-16 lg:pt-0 min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    )
}
