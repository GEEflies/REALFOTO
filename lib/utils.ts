import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isValidImageType(type: string): boolean {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(type)
}

export function getBase64FromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            const result = reader.result as string
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = (error) => reject(error)
    })
}
