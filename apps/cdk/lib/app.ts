import { App, Environment } from 'aws-cdk-lib'
import BackendStack from './backend'
import 'dotenv/config'
import FrontendStack from "./frontend";

const app = new App({ autoSynth: true })

// Load environmental variables
if (
    !process.env.CERTIFICATE_ARN ||
    !process.env.HOSTED_ZONE_ID ||
    !process.env.MONGODB_URI_PROD
) {
    throw new Error('Missing environmental variables')
}

// Deploy staging
if (process.env.PR_NUM) {
    const env: Environment = { region: 'us-east-1' }
    new BackendStack(
        app,
        `antalmanac-backend-staging-${process.env.PR_NUM}`,
        {
            env,
            stage: 'dev',
            certificateArn: process.env.CERTIFICATE_ARN,
            hostedZoneId: process.env.HOSTED_ZONE_ID,
            mongoDbUriProd: process.env.MONGODB_URI_PROD,
            prNum: process.env.PR_NUM
        },
    )
    if (process.env.apiSubDomain !== 'dev') {
        new FrontendStack(app, `antalmanac-frontend-staging-${process.env.PR_NUM}`, {
            env,
            stage: 'dev',
            certificateArn: process.env.CERTIFICATE_ARN,
            hostedZoneId: process.env.HOSTED_ZONE_ID,
            prNum: process.env.PR_NUM
        })
    }
}

// Deploy normally
else {
    const stages = {
        alpha: 'us-west-1',
    }
    // TODO: Uncomment when ready to deploy to prod
    // stages = {
    //     dev: 'us-east-1',
    //     prod: 'us-west-1',
    // }

    for (const [stage, region] of Object.entries(stages)) {
        const env: Environment = {region: region}

        new BackendStack(app, `${stage}-${region}-Backend`, {
            env,
            stage,
            certificateArn: process.env.CERTIFICATE_ARN,
            hostedZoneId: process.env.HOSTED_ZONE_ID,
            mongoDbUriProd: process.env.MONGODB_URI_PROD,
        })
        if (stage !== 'prod') {
            new FrontendStack(app, `${stage}-${region}-Frontend`, {
                env,
                stage,
                certificateArn: process.env.CERTIFICATE_ARN,
                hostedZoneId: process.env.HOSTED_ZONE_ID
            })
        }
    }
}