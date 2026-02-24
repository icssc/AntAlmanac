import { BLUE } from "$src/globals";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "https://antalmanac.com",
        scope: "https://antalmanac.com",
        name: "AntAlmanac",
        description: "A course exploration and scheduling tool for UCI Anteaters",
        lang: "en",
        dir: "ltr",
        start_url: "/",
        display: "standalone",
        theme_color: BLUE,
        background_color: BLUE,
        orientation: "portrait",
        categories: ["education", "productivity", "utilities"],
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
        screenshots: [
            // We should probably add nicer screenshots later
            {
                src: "/screenshots/desktop.png",
                sizes: "1280x630",
                type: "image/png",
                form_factor: "wide",
                label: "Schedule and course search",
            },
            {
                src: "/screenshots/mobile_calendar.png",
                sizes: "750x1626",
                type: "image/png",
                form_factor: "narrow",
                label: "Calendar with schedule",
            },
            {
                src: "/screenshots/mobile_classes.png",
                sizes: "750x1626",
                type: "image/png",
                form_factor: "narrow",
                label: "Course search result",
            },
        ],
    };
}
