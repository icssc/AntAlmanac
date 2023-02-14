import 'source-map-support/register'
import { App, Environment } from 'aws-cdk-lib'
// import CognitoStack from './cognito'
import BackendStack from './backend'
// import CloudwatchStack from './cloudwatch'
import 'dotenv/config'

const app = new App({ autoSynth: true })
const account = process.env['ACCOUNT_ID']

const stages = {
    dev: 'us-east-1',
    prod: 'us-west-1'
}

for (const [stage, region] of Object.entries(stages)) {
    const env: Environment = { region: region, account: account }

    // new CognitoStack(app, `${stage}-${region}-Cognito`, { env, stage })
    new BackendStack(app, `${stage}-${region}-Backend`, { env, stage })
    // new CloudwatchStack(app, `${stage}-${region}-Cloudwatch`, { env, stage })
}
