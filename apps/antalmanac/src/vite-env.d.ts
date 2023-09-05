import 'vite/client';
import 'vite-plugin-svgr/client';

declare module '*.svg';

interface ImportMetaEnv {
    /**
     * Can manually set the VITE_API_ENDPOINT environment variable.
     * @example "https://staging-123.api.antalmanac.com"
     * @example "https://dev.api.antalmanac.com"
     * @example "https://localhost:3000"
     */
    VITE_ANTALMANAC_API_ENDPOINT?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
