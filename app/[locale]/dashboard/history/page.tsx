import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Download, Clock } from 'lucide-react'

export default async function HistoryPage() {
    const t = await getTranslations('Dashboard.history')
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div className="p-8 text-center">Please log in to view history</div>
    }

    const { data: images } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

            {!images || images.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
                    <p className="text-gray-500">{t('empty.description')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((img: any) => (
                        <div key={img.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                            <div className="relative aspect-[4/3] bg-gray-100">
                                {/* Compare View - Logic would require client component usually. 
                                    For simplicty showing enhanced if available, else original */}
                                <Image
                                    src={img.enhanced_url || img.original_url}
                                    alt="Enhanced"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${img.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            img.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {img.status}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(img.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {img.enhanced_url && (
                                    <a
                                        href={img.enhanced_url + '?download=true'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
