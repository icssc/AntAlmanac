import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface CloudwatchProps extends StackProps {
    stage: string;
}

export default class CloudwatchStack extends Stack {
    constructor(scope: Construct, id: string, props?: CloudwatchProps) {
        super(scope, id, props);
    }
}
