import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import CognitoStack from "./cognito";
import WebsiteStack from "./website";
import CloudwatchStack from "./cloudwatch";
require('dotenv').config()

const app = new App({autoSynth: true});
const account = process.env["ACCOUNT_ID"]

const stages = {
    'beta': 'us-east-1',
    // 'prod': 'us-west-1'
}

for (const [stage, region] of Object.entries(stages)) {
    const env = {region: region, account: account}

    new CognitoStack(app, `${stage}-${region}-Cognito`, { env });
    new WebsiteStack(app, `${stage}-${region}-Website`, { env });
    new CloudwatchStack(app, `${stage}-${region}-Cloudwatch`, { env });
}
