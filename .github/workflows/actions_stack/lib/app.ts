import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import ActionsStack from './actions'

import 'dotenv/config'

const app = new App({ autoSynth: true })
const account = process.env['ACCOUNT_ID']

if (process.env.PR_NUM){ // check if called from AntAlmanac Github action
    new ActionsStack(app, `github-actions-stack-${process.env.PR_NUM}`, {pr_num: process.env.PR_NUM, env: {region: 'us-east-1', account: account}})
}
else{
    console.log("Something went wrong and/or this file shouldn't have been run");
}
