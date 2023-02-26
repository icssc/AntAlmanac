import { App } from 'aws-cdk-lib';
import ActionsStack from './actions';

import 'dotenv/config';
import * as process from "process";

const app = new App({ autoSynth: true });

if (!process.env.PR_NUM || !process.env.CERTIFICATE_ARN || !process.env.HOSTED_ZONE_ID ){
    throw new Error("Environmental variables weren't provided and/or this file shouldn't have been run");
}

new ActionsStack(app, `antalmanac-frontend-staging-${process.env.PR_NUM}`, {
    pr_num: process.env.PR_NUM,
    certificateArn: process.env.CERTIFICATE_ARN,
    hostedZoneId: process.env.HOSTED_ZONE_ID,
    env: { region: 'us-east-1' },
})
