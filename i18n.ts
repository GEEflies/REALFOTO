import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['sk'];

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !locales.includes(locale as any)) {
        console.log('Invalid or undefined locale, falling back to sk. Received:', locale)
        locale = 'sk';
    }

    return {
        locale: locale as string,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
