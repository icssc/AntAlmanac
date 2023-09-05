import { type } from 'arktype';
import { Stack, type StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as dynamnodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import type { Construct } from 'constructs';

import { zoneName } from '../constants';

export class BackendStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        /**
         * If {@link env.PR_NUM} is defined, then {@link env.NODE_ENV} should be 'staging'.
         */
        const env = type({
            CERTIFICATE_ARN: 'string',
            HOSTED_ZONE_ID: 'string',
            MONGODB_URI_PROD: 'string',
            NODE_ENV: 'string',
            'PR_NUM?': 'string',
        }).assert({ ...process.env });

        /**
         * The domain that the backend API will be hosted on.
         *
         * @example "api", "staging-123.api"
         * @example complete domain name: "api.antalmanac.com", "staging-123.api.antalmanac.com"
         */
        const domain = env.PR_NUM ? `staging-${env.PR_NUM}.api` : env.NODE_ENV === 'production' ? 'api' : 'dev.api';

        const userDataDDB = new dynamnodb.Table(this, `${id}-userdata-ddb`, {
            partitionKey: {
                name: 'id',
                type: dynamnodb.AttributeType.STRING,
            },
            billingMode: dynamnodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: env.NODE_ENV === 'staging' ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        });

        const handler = new lambda.Function(this, `${id}-lambda`, {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('../backend/dist'),
            handler: 'lambda.handler',
            timeout: Duration.seconds(5),
            memorySize: 256,
            environment: {
                // We don't need dev database because we will never write to it.
                AA_MONGODB_URI: env.MONGODB_URI_PROD,
                STAGE: env.NODE_ENV,
                USERDATA_TABLE_NAME: userDataDDB.tableName,
            },
        });

        userDataDDB.grantReadWriteData(handler);

        const certificate = acm.Certificate.fromCertificateArn(
            this,
            `${id}-api-gateway-certificate`,
            env.CERTIFICATE_ARN
        );

        const apiGateway = new apigateway.LambdaRestApi(this, `${id}-api-gateway`, {
            handler,
            domainName: {
                domainName: `${domain}.${zoneName}`,
                certificate,
                endpointType: apigateway.EndpointType.EDGE,
            },
        });

        const zone = route53.HostedZone.fromHostedZoneAttributes(this, `${id}-hosted-zone`, {
            zoneName,
            hostedZoneId: env.HOSTED_ZONE_ID,
        });

        const target = new targets.ApiGateway(apiGateway);

        new route53.ARecord(this, `${id}-a-record`, {
            zone: zone,
            recordName: domain,
            target: route53.RecordTarget.fromAlias(target),
        });
    }
}
