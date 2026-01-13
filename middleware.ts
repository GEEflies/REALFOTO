import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'sk'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Always use prefix for consistency
    localePrefix: 'as-needed'
});

export const config = {
    // Match only internationalized pathnames
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
