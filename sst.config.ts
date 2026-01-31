/// <reference path="./.sst/platform/config.d.ts" />

function getDomain() {
    if ($app.stage === 'production') {
        return 'antalmanac.com';
    } else if ($app.stage === 'staging-shared') {
        return 'staging-shared.antalmanac.com';
    } else if ($app.stage.match(/^staging-(\d+)$/)) {
        const subdomainPrefix = $app.stage.replace('staging-', 'scheduler-');
        return `${subdomainPrefix}.antalmanac.com`;
    }

    throw new Error('Invalid stage');
}

const isPermanentStage = ['production', 'scheduler', 'staging-shared'];

export default $config({
    app(input) {
        return {
            name: 'antalmanac',
            removal: isPermanentStage.includes(input?.stage) ? 'retain' : 'remove',
            protect: isPermanentStage.includes(input?.stage),
            home: 'aws',
        };
    },
    async run() {
        const domain = getDomain();

        const router = new sst.aws.Router('AntAlmanacRouter', {
            domain: {
                name: domain,
                aliases: $app.stage === 'production' ? [`www.${domain}`] : undefined,
            },
        });

        new sst.aws.Nextjs('Website', {
            path: 'apps/antalmanac',
            router: {
                instance: router,
                path: '/',
            },
            cachePolicy: '92d18877-845e-47e7-97e6-895382b1bf7c',
            environment: {
                DB_URL: $app.stage === 'production' ? process.env.PROD_DB_URL : process.env.DEV_DB_URL,
                MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
                NEXT_PUBLIC_TILES_ENDPOINT: process.env.NEXT_PUBLIC_TILES_ENDPOINT,
                ANTEATER_API_KEY: process.env.ANTEATER_API_KEY,
                OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID,
                OIDC_ISSUER_URL: process.env.OIDC_ISSUER_URL,
                GOOGLE_REDIRECT_URI: `https://${domain}/auth`,
                NEXT_PUBLIC_BASE_URL: domain,
                NEXT_PUBLIC_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY,
            },
        });
    },
});
