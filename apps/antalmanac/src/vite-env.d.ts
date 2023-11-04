/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '*.svg';

interface ImportMetaEnv {
    // Both of these variables should rarely be set manually
    VITE_ENDPOINT?: string; // Sets the subdomain to use for API calls (ex. **staging-123**.api.antalmanac.com)
    VITE_LOCAL_SERVER?: string; // Sets the local server to use for API calls (e.g. http://localhost:8080)
    VITE_TILES_ENDPOINT?: string; // Sets the url of the map tiles server
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
