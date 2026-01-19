import createMiddleware from 'next-intl/middleware';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/nastenka', '/sk/nastenka'];

// Check if user is authenticated via Supabase session cookie
async function isAuthenticated(request: NextRequest): Promise<boolean> {
    try {
        // Create a Supabase client configured to use cookies
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        // In middleware we primarily read. 
                        // Token modification usually happens in route handlers or client.
                    },
                },
            }
        )

        // getUser() validates the token against Supabase Auth
        const { data: { user }, error } = await supabase.auth.getUser()

        return !error && !!user
    } catch (error) {
        console.error('Middleware Auth Check Error:', error)
        return false
    }
}

// Internationalization middleware
const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['sk'],

    // Used when no locale matches
    defaultLocale: 'sk',

    // Always use prefix for consistency
    localePrefix: 'as-needed'
});

export default async function middleware(request: NextRequest) {
    let { pathname } = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Handle 'app' subdomain (including www.app): Rewrite root '/' to '/nastenka'
    const isAppSubdomain = hostname.startsWith('app.') || hostname.startsWith('www.app.');

    if (isAppSubdomain && pathname === '/') {
        pathname = '/nastenka';
        const url = request.nextUrl.clone();
        url.pathname = '/nastenka';
        // Update request object to be used by subsequent logic and intlMiddleware
        request = new NextRequest(url, request);
    }

    // Strict App Subdomain Restriction
    // Prevent access to public landing pages (like /odstranit, /vylepsit) on the app subdomain
    if (request.method === 'OPTIONS') {
        return NextResponse.next();
    }

    if (isAppSubdomain) {
        const isAllowedPath =
            pathname === '/nastenka' ||
            pathname.includes('/nastenka') ||
            pathname.includes('/auth') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/_next') ||
            pathname.includes('.'); // static files

        if (!isAllowedPath) {
            // Redirect all other traffic (e.g. /odstranit, /vylepsit, /prihlasenie) to dashboard
            return NextResponse.redirect(new URL('/nastenka', request.url));
        }
    } else {
        // Enforce Dashboard on Subdomain ONLY
        // If trying to access /nastenka from main domain (not app subdomain), redirect to subdomain
        if (pathname === '/nastenka' || pathname.startsWith('/nastenka/') || pathname === '/sk/nastenka' || pathname.startsWith('/sk/nastenka/')) {
            // Skip for localhost to allow development
            if (!hostname.includes('localhost')) {
                let targetHost = 'www.app.realfoto.sk';
                if (hostname.includes('aurix.pics')) {
                    targetHost = 'app.aurix.pics';
                }

                const url = new URL(request.url);
                url.hostname = targetHost;
                url.protocol = 'https:';
                return NextResponse.redirect(url);
            }
        }
    }

    // Check if route requires authentication (only for main domain)
    // App subdomain auth is handled client-side to avoid cookie sharing issues
    const isProtectedRoute = !hostname.startsWith('app.') && !hostname.startsWith('www.app.') && protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isProtectedRoute) {
        const authenticated = await isAuthenticated(request);

        if (!authenticated) {
            // Normal relative redirect for main domain
            const locale = 'sk';
            const loginUrl = new URL(`/${locale}/prihlasenie`, request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Apply internationalization middleware
    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/nastenka/:path*']
};

