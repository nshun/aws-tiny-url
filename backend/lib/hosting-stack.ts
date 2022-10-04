import { Construct } from 'constructs';
import {
  CfnOutput,
  Stack,
  StackProps,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_s3_deployment as s3deploy,
} from 'aws-cdk-lib';

import * as path from 'path';

export class HostingStack extends Stack {
  public bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // S3 bucket for CloudFront origin
    this.bucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    new CfnOutput(this, 'BucketName', { value: this.bucket.bucketName });

    // CloudFront distribution
    const cfBaseProps: cloudfront.DistributionProps = {
      comment: 'TinyURL',
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
    };
    const distribution = new cloudfront.Distribution(this, 'Distribution', cfBaseProps);
    new CfnOutput(this, 'CfDomain', { value: distribution.distributionDomainName });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3deploy.Source.asset(path.resolve(__dirname, '../../frontend/dist/'))],
      destinationBucket: this.bucket,
      distribution,
      distributionPaths: ['/*'],
    });
  }
}
