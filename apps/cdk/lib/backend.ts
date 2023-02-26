import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as dynamnodb from 'aws-cdk-lib/aws-dynamodb'

interface BackendProps extends StackProps {
    stage: string;
    mongoDbUriProd: string;
    hostedZoneId: string;
    certificateArn: string;
    pr_num?: string;
}

const transformUrl = (url: string, props: BackendProps): string => {
    if (props.pr_num !== undefined) {
        return `staging-${props.pr_num}.${url}`;
    }
    return (props.stage === 'dev' ? 'dev.' : '') + url;
};

export default class BackendStack extends Stack {
    constructor(scope: Construct, id: string, props: BackendProps) {
        super(scope, id, props);

        const userDataDDB = new dynamnodb.Table(this, `antalmanac-userdata-ddb-${props.stage}`, {
            partitionKey: { name: 'id', type: dynamnodb.AttributeType.STRING },
            billingMode: dynamnodb.BillingMode.PAY_PER_REQUEST
        })

        const api = new lambda.Function(this, `antalmanac-api-${props.stage}-lambda`, {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('functions/antalmanac-backend'),
            handler: 'lambda.handler',
            environment: {
                // We don't need dev database because we will never write to it
                AA_MONGODB_URI: props.mongoDbUriProd,
                STAGE: props.stage,
                USERDATA_TABLE_NAME: userDataDDB.tableName
            },
        });

        userDataDDB.grantReadWriteData(api)

        const zone = route53.HostedZone.fromHostedZoneAttributes(this, `antalmanac-DNS-${props.stage}`, {
            zoneName: 'antalmanac.com',
            hostedZoneId: props.hostedZoneId,
        });

        const apiGateway = new apigateway.LambdaRestApi(this, `antalmanac-api-gateway-${props.stage}`, {
            handler: api,
            domainName: {
                domainName: transformUrl('api.antalmanac.com', props),
                certificate: acm.Certificate.fromCertificateArn(
                    this,
                    `api-gateway-cert-${props.stage}`,
                    props.certificateArn
                ),
                endpointType: apigateway.EndpointType.EDGE,
            },
        });

        new route53.ARecord(this, `antalmanac-backend-a-record-${props.stage}`, {
            zone: zone,
            recordName: transformUrl('api', props),
            target: route53.RecordTarget.fromAlias(new targets.ApiGateway(apiGateway)),
        });
    }
}
