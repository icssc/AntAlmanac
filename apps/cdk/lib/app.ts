import { App, Environment } from 'aws-cdk-lib'
// import CognitoStack from './cognito'
import BackendStack from './backend'
// import CloudwatchStack from './cloudwatch'
import 'dotenv/config'

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
}

// Deploy normally
else {
    let stages;
    if (process.env.ALPHA) {
        stages = {
            alpha: 'us-east-1',
        }
    }
    else {
        // TODO: Uncomment when ready to deploy to prod
        // stages = {
        //     dev: 'us-east-1',
        //     prod: 'us-east-1',
        // }
    }
    for (const [stage, region] of Object.entries(stages)) {
        const env: Environment = {region: region}

        // new CognitoStack(app, `${stage}-${region}-Cognito`, { env, stage })
        new BackendStack(app, `antalmanac-backend-${stage}`, {
            env,
            stage,
            certificateArn: process.env.CERTIFICATE_ARN,
            hostedZoneId: process.env.HOSTED_ZONE_ID,
            mongoDbUriProd: process.env.MONGODB_URI_PROD,
        })
        // new CloudwatchStack(app, `${stage}-${region}-Cloudwatch`, { env, stage })
    }
}