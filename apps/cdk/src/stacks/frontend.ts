import { type } from 'arktype';
import { Stack, type StackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as awsCloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as awsCloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as awsIam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import type { Construct } from 'constructs';

import { zoneName } from '../constants';

export class FrontendStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        /**
         * If {@link env.PR_NUM} is defined, then {@link env.NODE_ENV} should be 'staging'.
         */
        const env = type({
            CERTIFICATE_ARN: 'string',
            HOSTED_ZONE_ID: 'string',
            NODE_ENV: 'string',
            'PR_NUM?': 'string',
        }).assert({ ...process.env });

        /**
         * The domain that the static website will be hosted on.
         */
        const domain = env.PR_NUM ? `staging-${env.PR_NUM}.antalmanac` : 'antalmanac';

        /**
         * Create an S3 bucket to hold the built static website's assets.
         */
        const websiteBucket = new s3.Bucket(this, `${id}-bucket`, {
            bucketName: domain,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        /**
         * Allow CloudFront (CDN) to access the S3 bucket.
         *
         * TODO: migrate from OAI to OAC because it's legacy ??
         *
         * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
         */
        const cloudfrontOriginAccessIdentity = new awsCloudfront.OriginAccessIdentity(this, 'cloudfront-OAI');

        /**
         * Policy statement for the S3 bucket, allowing CloudFront to access the bucket.
         */
        const policyStatement = new awsIam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [websiteBucket.arnForObjects('*')],
            principals: [
                new awsIam.CanonicalUserPrincipal(
                    cloudfrontOriginAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
                ),
            ],
        });

        websiteBucket.addToResourcePolicy(policyStatement);

        const certificate = acm.Certificate.fromCertificateArn(
            this,
            `${id}-api-gateway-certifcate`,
            env.CERTIFICATE_ARN
        );

        /**
         * A CloudFront origin indicates a location where the CDN can direct requests to.
         * For a static website, direct all requests to the S3 bucket.
         */
        const s3Origin = new awsCloudfrontOrigins.S3Origin(websiteBucket, {
            originAccessIdentity: cloudfrontOriginAccessIdentity,
        });

        const distribution = new awsCloudfront.Distribution(this, `${id}-cloudfront-distribution`, {
            certificate: certificate,
            defaultRootObject: 'index.html',
            domainNames: [domain],
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
            defaultBehavior: {
                origin: s3Origin,
                allowedMethods: awsCloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: awsCloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
        });

        new s3Deployment.BucketDeployment(this, `${id}-bucket-deployment`, {
            sources: [s3Deployment.Source.asset('../antalmanac/build')],
            destinationBucket: websiteBucket,
            distribution: distribution,
            distributionPaths: ['/*'],
        });

        const zone = route53.HostedZone.fromHostedZoneAttributes(this, `${id}-hosted-zone`, {
            zoneName,
            hostedZoneId: env.HOSTED_ZONE_ID,
        });

        const target = new targets.CloudFrontTarget(distribution);

        new route53.ARecord(this, `${id}-a-record`, {
            zone: zone,
            recordName: domain,
            target: route53.RecordTarget.fromAlias(target),
        });
    }
}
