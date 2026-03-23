declare global {
  namespace NodeJS {
    /**
     * Define schema for environment variables
     */
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'staging';
      PORT?: string;
      PUBLIC_API_URL: string;
      MONGO_URL: string;
      SESSION_SECRET: string;
      OIDC_CLIENT_ID: string;
      OIDC_ISSUER_URL: string;
      PRODUCTION_DOMAIN: string;
      ADMIN_EMAILS: string;
      ANTEATER_API_KEY?: string;
      EXTERNAL_USER_READ_SECRET?: string;
    }
  }
}

// need to export something to be considered a 'module'
export {};
