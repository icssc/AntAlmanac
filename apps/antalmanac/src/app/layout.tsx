import type { Metadata } from 'next';

const ANTALMANAC_DESCRIPTION = 'A schedule planning and course exploration tool for UCI students.';

export const metadata: Metadata = {
    title: 'AntAlmanac - UCI Schedule Planner',
    description: ANTALMANAC_DESCRIPTION,
    manifest: '/manifest.json',
    metadataBase: new URL('https://antalmanac.com'),
    twitter: {
        card: 'summary_large_image',
        title: 'AntAlmanac',
        description: ANTALMANAC_DESCRIPTION,
        images: '/logo.png',
    },
    openGraph: {
        title: 'AntAlmanac',
        description: ANTALMANAC_DESCRIPTION,
        url: 'https://antalmanac.com',
        siteName: 'AntAlmanac',
        images: '/logo.png',
    },
    appleWebApp: {
        title: 'AntAlmanac',
        statusBarStyle: 'black-translucent',
        capable: true,
    },
    keywords: [
        'UCI',
        'Anteater',
        'search',
        'classes',
        'Calendar',
        'development',
        'software',
        'add courses',
        'antalmanac',
        'course',
        'course planner',
    ],
};

export const viewport = {
    themeColor: '#305db7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                {/* <style>
                    {`
                @media (min-resolution: 120dpi) {
                    html {
                        font-size: 14px;
                    }
                }
                @media (min-resolution: 144dpi) {
                    html {
                        font-size: 12px;
                    }
                }
                `}
                </style> */}

                {/* NOTE: These static CSS files need to be in the 'public' directory */}
                {/* <link rel="stylesheet" href="/google_font_roboto_300_400_500_700.css" />
                <link
                    rel="stylesheet"
                    href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
                /> */}

                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                    console.log(
                        '%cInterested in improving AntAlmanac?\n - Checkout the project on GitHub: https://github.com/icssc/antalmanac\n - Join our Discord: https://discord.gg/GzF76D7UhY\n - Leave feedback: https://antalmanac.com/feedback',
                        'color: #305db7; font-size: 15px'
                    );
                `,
                    }}
                />
            </head>
            {/* <body style={{ overflow: 'hidden' }}> */}
            <body>
                <noscript> You need to enable JavaScript to run this app. </noscript>
                {children}
            </body>
        </html>
    );
}
