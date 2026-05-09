import { Providers } from '$src/app/providers';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { WebApplication, WebSite, WithContext } from 'schema-dts';

import './globals.css';

const ANTALMANAC_DESCRIPTION =
    'Search UCI courses across 140+ departments and build your class schedule with AntAlmanac. Check grade distributions, view classes on a campus map, and plan your ideal quarter.';

export const metadata: Metadata = {
    title: {
        default: 'AntAlmanac — UCI Course & Schedule Planner',
        template: '%s | AntAlmanac',
    },
    description: ANTALMANAC_DESCRIPTION,
    manifest: '/manifest.json',
    metadataBase: new URL('https://antalmanac.com'),
    alternates: {
        canonical: 'https://antalmanac.com',
    },
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
        ],
        apple: '/apple-touch-icon.png',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AntAlmanac — UCI Course & Schedule Planner',
        description: ANTALMANAC_DESCRIPTION,
        images: '/og-image.png',
    },
    openGraph: {
        title: 'AntAlmanac — UCI Course & Schedule Planner',
        description: ANTALMANAC_DESCRIPTION,
        url: 'https://antalmanac.com',
        siteName: 'AntAlmanac',
        images: '/og-image.png',
    },
    appleWebApp: {
        title: 'AntAlmanac',
        statusBarStyle: 'black-translucent',
        capable: true,
    },
    keywords: [
        'UCI',
        'UC Irvine',
        'Anteater',
        'UCI courses',
        'UCI course search',
        'UCI schedule',
        'UCI class schedule',
        'UCI schedule planner',
        'course planner',
        'WebSOC alternative',
        'UCI enrollment',
        'UCI GE requirements',
        'grade distributions',
        'antalmanac',
    ],
};

export const viewport: Viewport = {
    themeColor: '#305db7',
    width: 'device-width',
    initialScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

const webAppSchema: WithContext<WebApplication> = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AntAlmanac',
    url: 'https://antalmanac.com',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'UCI course and schedule planner for UC Irvine students.',
    featureList: 'Course search, Schedule builder, Grade distributions, Campus map, 4-year planner',
    author: { '@type': 'Organization', name: 'ICS Student Council', url: 'https://icssc.club' },
};

const siteSchema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AntAlmanac',
    url: 'https://antalmanac.com',
    potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://antalmanac.com/?search={query}' },
        ...({ 'query-input': 'required name=query' } as object),
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify([webAppSchema, siteSchema]) }}
                />
                <Script>
                    {`console.log(
                        '%cInterested in improving AntAlmanac?\\n - Check out the project on GitHub: https://github.com/icssc/antalmanac\\n - Join our Discord: https://discord.gg/GzF76D7UhY\\n - Leave feedback: https://antalmanac.com/feedback',
                        'color: #305db7; font-size: 15px'
                    );`}
                </Script>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
