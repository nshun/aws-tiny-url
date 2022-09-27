import { Construct } from 'constructs';
import {
  Stack,
  StackProps,
  RemovalPolicy,
  aws_iam as iam,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigateway,
} from 'aws-cdk-lib';

import * as path from 'path';
import * as fs from 'fs';

export class TinyUrlStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'TinyUrl', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      timeToLiveAttribute: 'expireDate',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const api = new apigateway.RestApi(this, 'TinyUrlApi');

    const putItemRole = new iam.Role(this, 'TinyUrlDdbWriteRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    table.grantWriteData(putItemRole);
    const putItemIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'PutItem',
      region: Stack.of(this).region,
      options: {
        credentialsRole: putItemRole,
        requestTemplates: {
          'application/json': fs
            .readFileSync(path.resolve(__dirname, './templates/ddb_putitem.req.vtl'))
            .toString()
            .replace(/{{TableName}}/g, table.tableName),
        },
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': fs
                .readFileSync(path.resolve(__dirname, './templates/ddb_putitem.res.vtl'))
                .toString(),
            },
          },
        ],
      },
    });
    api.root.addMethod('POST', putItemIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });

    const idResouce = api.root.addResource('{id}');
    const getItemRole = new iam.Role(this, 'TinyUrlDdbReadRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    table.grantReadData(getItemRole);
    const getItemIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'GetItem',
      region: Stack.of(this).region,
      options: {
        credentialsRole: getItemRole,
        requestTemplates: {
          'application/json': fs
            .readFileSync(path.resolve(__dirname, './templates/ddb_getitem.req.vtl'))
            .toString()
            .replace(/{{TableName}}/g, table.tableName),
        },
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': fs
                .readFileSync(path.resolve(__dirname, './templates/ddb_getitem.res.vtl'))
                .toString(),
            },
          },
        ],
      },
    });
    idResouce.addMethod('GET', getItemIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });
  }
}