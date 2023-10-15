import { RemovalPolicy, Stack, StackProps, Duration } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as dynamnodb from 'aws-cdk-lib/aws-dynamodb'
import { transformUrl } from './helpers'

export interface BackendProps extends StackProps {
    stage: string
    mongoDbUriProd: string
    mapboxAccessToken: string
    hostedZoneId: string
    certificateArn: string
    prNum?: string
}

export default class BackendStack extends Stack {
    constructor(scope: Construct, id: string, props: BackendProps) {
        super(scope, id, props)

        const userDataDDB = new dynamnodb.Table(this, `antalmanac-userdata-ddb-${props.stage}`, {
            partitionKey: {
                name: 'id',
                type: dynamnodb.AttributeType.STRING,
            },
            billingMode: dynamnodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy:
                props.stage === 'dev' || props.stage === 'prod'
                    ? RemovalPolicy.RETAIN
                    : RemovalPolicy.DESTROY,
        })

        const api = new lambda.Function(this, `antalmanac-api-${props.stage}-lambda`, {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('../backend/dist'),
            handler: 'lambda.handler',
            timeout: Duration.seconds(5),
            memorySize: 256,
            environment: {
                // We don't need dev database because we will never write to it
                AA_MONGODB_URI: props.mongoDbUriProd,
                STAGE: props.stage,
                USERDATA_TABLE_NAME: userDataDDB.tableName,
                MAPBOX_ACCESS_TOKEN: props.mapboxAccessToken,
            },
        })

        userDataDDB.grantReadWriteData(api)

        const zone = route53.HostedZone.fromHostedZoneAttributes(
            this,
            `antalmanac-DNS-${props.stage}`,
            {
                zoneName: 'antalmanac.com',
                hostedZoneId: props.hostedZoneId,
            },
        )

        const apiGateway = new apigateway.LambdaRestApi(
            this,
            `antalmanac-api-gateway-${props.stage}`,
            {
                handler: api,
                domainName: {
                    domainName: transformUrl('api.antalmanac.com', props),
                    certificate: acm.Certificate.fromCertificateArn(
                        this,
                        `api-gateway-cert-${props.stage}`,
                        props.certificateArn,
                    ),
                    endpointType: apigateway.EndpointType.EDGE,
                },
                binaryMediaTypes: ['image/*'],
                integrationOptions: {
                    integrationResponses: [
                        {
                            statusCode: '200',
                            contentHandling: apigateway.ContentHandling.CONVERT_TO_BINARY,
                        },
                    ],
                },
            },
        )

        new route53.ARecord(this, `antalmanac-backend-a-record-${props.stage}`, {
            zone: zone,
            recordName: transformUrl('api', props),
            target: route53.RecordTarget.fromAlias(new targets.ApiGateway(apiGateway)),
        })
    }
}
