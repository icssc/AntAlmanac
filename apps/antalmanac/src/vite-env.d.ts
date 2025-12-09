/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '*.svg';

interface ImportMetaEnv {
    // Both of these variables should rarely be set manually
    NEXT_PUBLIC_ENDPOINT?: string; // Sets the subdomain to use for API calls (ex. **staging-123**.api.antalmanac.com)
    NEXT_PUBLIC_LOCAL_SERVER?: string; // Sets the local server to use for API calls (e.g. http://localhost:8080)
    NEXT_PUBLIC_TILES_ENDPOINT?: string; // Sets the url of the map tiles server
    NEXT_PUBLIC_PUBLIC_POSTHOG_KEY?: string; // Sets public key of PostHog project
    NEXT_PUBLIC_PUBLIC_POSTHOG_HOST?: string; // Sets public host of PostHog project
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
