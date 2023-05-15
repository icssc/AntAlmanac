/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
interface ImportMetaEnv {
    USERDATA_TABLE_NAME: string;
    AA_MONGODB_URI: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
