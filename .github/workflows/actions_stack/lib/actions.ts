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

interface ActionsProps extends StackProps {
    pr_num: string
}

export default class ActionsStack extends Stack {
    constructor(scope: Construct, id: string, props?: ActionsProps) {
        super(scope, id, props)

        const url = `staging-${props.pr_num}.antalmanac.com`

        const websiteBucket = new s3.Bucket(
            this,
            `antalmanac-staging-bucket-${props.pr_num}`,
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
            process.env.CERTIFICATE_ARN,
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
                hostedZoneId: process.env.HOSTED_ZONE_ID,
            },
        )

        new route53.ARecord(
            this,
            `antalmanac-staging-a-record-${props.pr_num}`,
            {
                zone: zone,
                recordName: `staging-${props.pr_num}`,
                target: route53.RecordTarget.fromAlias(
                    new targets.CloudFrontTarget(distribution),
                ),
            },
        )

        new s3Deployment.BucketDeployment(this, 'deploySiteToBucket', {
            sources: [
                s3Deployment.Source.asset('../../../build'),
            ],
            destinationBucket: websiteBucket,
            distribution: distribution,
            distributionPaths: ['/*'],
        })
    }
}
