import { App } from 'aws-cdk-lib';
import ActionsStack from './actions';

import 'dotenv/config';
import * as process from "process";

const app = new App({ autoSynth: true });

if (!process.env.PR_NUM || !process.env.CERTIFICATE_ARN || !process.env.HOSTED_ZONE_ID || !process.env.ACCOUNT_ID){
    throw new Error("Environemntal variables weren't provided and/or this file shouldn't have been run");
}

const account = process.env['ACCOUNT_ID'];

new ActionsStack(app, `github-actions-stack-${process.env.PR_NUM}`, {
    pr_num: process.env.PR_NUM,
    certificateArn: process.env.CERTIFICATE_ARN,
    hostedZoneId: process.env.HOSTED_ZONE_ID,
    env: { region: 'us-east-1', account: account },
})
