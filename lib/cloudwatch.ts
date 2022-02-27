import {Stack} from "aws-cdk-lib";
import {Construct} from "constructs";

interface CloudwatchProps {

}

export default class CloudwatchStack extends Stack {
    constructor(scope: Construct, id: string, props?: CloudwatchProps) {
        super(scope, id, props);
    }
}