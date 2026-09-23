declare global {
    namespace NodeJS {
        /**
         * Define schema for environment variables
         */
        interface ProcessEnv {
            PORT?: string;
            PUBLIC_API_URL: string;
            MONGO_URL: string;
            PLANNER_SESSION_SECRET: string;
            OIDC_CLIENT_ID: string;
            OIDC_ISSUER_URL: string;
            PRODUCTION_DOMAIN: string;
            ADMIN_EMAILS: string;
            ANTEATER_API_KEY?: string;
            PLANNER_CLIENT_API_KEY?: string;
        }
    }
}

// need to export something to be considered a 'module'
export {};
