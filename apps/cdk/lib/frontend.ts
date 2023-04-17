import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
    Distribution,
    OriginAccessIdentity,
    AllowedMethods,
    ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { PolicyStatement, CanonicalUserPrincipal } from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import { transformUrl } from './helpers'

export interface FrontendProps extends StackProps {
    stage: string
    certificateArn: string
    hostedZoneId: string
    prNum?: string
}

export default class FrontendStack extends Stack {
    constructor(scope: Construct, id: string, props: FrontendProps) {
        super(scope, id, props)

        const url = transformUrl('antalmanac.com', props)

        const websiteBucket = new s3.Bucket(
            this,
            `antalmanac-frontend-bucket-${props.stage}`,
            {
                bucketName: url,
                removalPolicy: RemovalPolicy.DESTROY,
                autoDeleteObjects: true,
            },
        )

        const cloudfrontOAI = new OriginAccessIdentity(this, 'cloudfront-OAI')

        websiteBucket.addToResourcePolicy(
            new PolicyStatement({
                actions: ['s3:GetObject'],
                resources: [websiteBucket.arnForObjects('*')],
                principals: [
                    new CanonicalUserPrincipal(
                        cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
                    ),
                ],
            }),
        )

        const cert = acm.Certificate.fromCertificateArn(
            this,
            `api-gateway-cert`,
            props.certificateArn,
        )

        const distribution = new Distribution(this, 'Distribution', {
            certificate: cert,
            defaultRootObject: 'index.html',
            domainNames: [url],
            defaultBehavior: {
                origin: new S3Origin(websiteBucket, {
                    originAccessIdentity: cloudfrontOAI,
                }),
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
        })

        const zone = route53.HostedZone.fromHostedZoneAttributes(
            this,
            `antalmanac-hostedzone`,
            {
                zoneName: 'antalmanac.com',
                hostedZoneId: props.hostedZoneId,
            },
        )

        new route53.ARecord(
            this,
            `antalmanac-frontend-a-record-${props.stage}`,
            {
                zone: zone,
                // Remove trailing . after transformUrl
                recordName: transformUrl('', props).slice(0, -1),
                target: route53.RecordTarget.fromAlias(
                    new targets.CloudFrontTarget(distribution),
                ),
            },
        )

        new s3Deployment.BucketDeployment(this, 'deploySiteToBucket', {
            sources: [s3Deployment.Source.asset('../antalmanac/build')],
            destinationBucket: websiteBucket,
            distribution: distribution,
            distributionPaths: ['/*'],
        })
    }
}
