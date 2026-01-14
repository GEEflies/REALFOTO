'use client'

import { motion } from 'framer-motion'

export function AnimatedZap({ className }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Background pulsating bolts */}
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute inset-0 text-amber-500/40 w-full h-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: [0, 0.6, 0],
                    scale: [0.8, 1.4, 1.8],
                    rotate: [0, -5, 5, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                }}
            >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />
            </motion.svg>

            {/* Main Bolt */}
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10 text-amber-500 w-full h-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
            >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
            </motion.svg>
        </div>
    )
}

export function AnimatedShield({ className }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500 w-full h-full"
            >
                {/* Shield Path */}
                <motion.path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    fill="rgba(59, 130, 246, 0.2)" // blue-500/20
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                {/* Checkmark Path */}
                <motion.path
                    d="m9 12 2 2 4-4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
                />
            </svg>
        </div>
    )
}

export function AnimatedTrend({ className }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500 w-full h-full"
            >
                {/* Main Curve */}
                <motion.polyline
                    points="23 18 13.5 8.5 8.5 13.5 1 6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
                />
                {/* Arrow Head */}
                <motion.polyline
                    points="17 18 23 18 23 12"
                    initial={{ opacity: 0, x: -5, y: -5 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.2, repeat: Infinity, repeatDelay: 3.2 }} // Sync with main curve end
                />
            </svg>
        </div>
    )
}
