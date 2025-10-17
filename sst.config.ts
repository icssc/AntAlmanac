/// <reference path="./.sst/platform/config.d.ts" />

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
        new sst.aws.Nextjs('Website', {
            path: 'apps/antalmanac',
            domain: 'sst2.antalmanac.com',
        });
    },
});
