/// <reference path="./.sst/platform/config.d.ts" />

function getDomain() {
    if ($app.stage === 'production') {
        return 'sst.antalmanac.com';
    } else if ($app.stage.match(/^staging-(\d+)$/)) {
        return `${$app.stage}.antalmanac.com`;
    }

    throw new Error('Invalid stage');
}

export default $config({
    app(input) {
        return {
            name: 'antalmanac',
            removal: input?.stage === 'production' ? 'retain' : 'remove',
            protect: ['production'].includes(input?.stage),
            home: 'aws',
        };
    },
    async run() {
        const domain = getDomain();

        new sst.aws.Nextjs('Website', {
            path: 'apps/antalmanac',
            domain: {
                name: domain,
                redirects: [`www.${domain}`],
            },
            environment: {
                DB_URL: $app.stage === 'production' ? process.env.PROD_DB_URL : process.env.DEV_DB_URL,
                MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
                ANTEATER_API_KEY: process.env.ANTEATER_API_KEY,
                GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
                GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
            },
        });
    },
});
