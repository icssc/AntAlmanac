import {Stack} from "aws-cdk-lib";
import {Construct} from "constructs";

interface CognitoProps {

}

export default class CognitoStack extends Stack {
    constructor(scope: Construct, id: string, props?: CognitoProps) {
        super(scope, id, props);
    }
}