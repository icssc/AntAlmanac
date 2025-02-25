import { Stack, type StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as dynamnodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import type { Construct } from 'constructs';
import { z } from 'zod';

import { deployEnvSchema } from '../../../backend/src/env';
import { zoneName } from '../lib/constants';

export class BackendStack extends Stack {
    /**
     * Env vars specifically for the CDK stack/deployment.
     *
     * If {@link env.PR_NUM} is defined, then {@link env.NODE_ENV} should be 'staging'.
     */
    static readonly CDKEnvironment = z.object({
        CERTIFICATE_ARN: z.string(),
        HOSTED_ZONE_ID: z.string(),
        ANTEATER_API_KEY: z.string(),
        NODE_ENV: z.string().optional(),
        PR_NUM: z.string().optional(),
    });

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const env = z.intersection(BackendStack.CDKEnvironment, deployEnvSchema).parse(process.env);

        /**
         * The domain that the backend API will be hosted on.
         *
         * @example "api", "staging-123.api"
         * @example complete domain name: "api.antalmanac.com", "staging-123.api.antalmanac.com"
         */
        const domain = env.PR_NUM ? `staging-${env.PR_NUM}.api` : env.NODE_ENV === 'production' ? 'api' : 'dev.api';
        const removalPolicy: RemovalPolicy = env.NODE_ENV === 'staging' ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN;
        const deletionProtection = removalPolicy === RemovalPolicy.RETAIN;

        const userDataDDB = new dynamnodb.Table(this, `userdata-ddb`, {
            partitionKey: {
                name: 'id',
                type: dynamnodb.AttributeType.STRING,
            },
            billingMode: dynamnodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy,
            deletionProtection,
        });

        const handler = new lambda.Function(this, 'lambda', {
            runtime: lambda.Runtime.NODEJS_LATEST,
            code: lambda.Code.fromAsset('../backend/dist'),
            handler: 'lambda.handler',
            timeout: Duration.seconds(20),
            memorySize: 256,
            environment: {
                ...env,
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
            binaryMediaTypes: ['image/*'],
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
