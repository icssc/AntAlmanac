import type { Metadata, Viewport } from "next";

import "./globals.css";

const ANTALMANAC_DESCRIPTION = "A schedule planning and course exploration tool for UCI students.";

export const metadata: Metadata = {
    title: "AntAlmanac - UCI Schedule Planner",
    description: ANTALMANAC_DESCRIPTION,
    manifest: "/manifest.json",
    metadataBase: new URL("https://antalmanac.com"),
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
            { url: "/favicon.svg", type: "image/svg+xml" },
        ],
        apple: "/apple-touch-icon.png",
    },
    twitter: {
        card: "summary_large_image",
        title: "AntAlmanac",
        description: ANTALMANAC_DESCRIPTION,
        images: "/logo.png",
    },
    openGraph: {
        title: "AntAlmanac",
        description: ANTALMANAC_DESCRIPTION,
        url: "https://antalmanac.com",
        siteName: "AntAlmanac",
        images: "/logo.png",
    },
    appleWebApp: {
        title: "AntAlmanac",
        statusBarStyle: "black-translucent",
        capable: true,
    },
    keywords: [
        "UCI",
        "Anteater",
        "search",
        "classes",
        "Calendar",
        "development",
        "software",
        "add courses",
        "antalmanac",
        "course",
        "course planner",
    ],
};

export const viewport: Viewport = {
    themeColor: "#305db7",
    width: "device-width",
    initialScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
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
            <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                {children}
            </body>
        </html>
    );
}
