import { Environment, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface CognitoProps extends StackProps {
    stage: string
}

export default class CognitoStack extends Stack {
    constructor(scope: Construct, id: string, props?: CognitoProps) {
        super(scope, id, props)
    }
}
