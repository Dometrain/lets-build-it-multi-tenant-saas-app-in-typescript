import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { aws_route53_targets as targets } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';

type StaticWebsiteProps = {
    domainName: string;
    certificate: certificatemanager.ICertificate;
    hostedZone: route53.IHostedZone;
    frontendPath: string,
};

export class StaticWebsite extends Construct {
    constructor(scope: Construct, id: string, props: StaticWebsiteProps) {
        super(scope, id);

        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            bucketName: props.domainName,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });

        const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');
        siteBucket.grantRead(originAccessIdentity);

        const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
            defaultRootObject: 'index.html',
            domainNames: [props.domainName],
            certificate: props.certificate,
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessIdentity(siteBucket, { originAccessIdentity }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            errorResponses: [
                {
                    // This is a bit of a hack to return the index page for client side routes...
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: "/index.html",
                    ttl: cdk.Duration.seconds(0),
                },
            ],
        });

        new route53.ARecord(this, 'SiteAliasRecord', {
            recordName: props.domainName,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
            zone: props.hostedZone,
        });

        new s3deploy.BucketDeployment(this, `DeployWithInvalidation-${Date.now()}`, {
            sources: [s3deploy.Source.asset(props.frontendPath)],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
        });
    }
}
