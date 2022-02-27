import {Stack} from "aws-cdk-lib";
import {Construct} from "constructs";

interface WebsiteProps {

}

export default class WebsiteStock extends Stack {
    constructor(scope: Construct, id: string, props?: WebsiteProps) {
        super(scope, id, props);
    }
}