import { Construct } from 'constructs';
import {
  Stack,
  StackProps,
  RemovalPolicy,
  aws_iam as iam,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigateway,
  aws_lambda as lambda,
} from 'aws-cdk-lib';

import * as path from 'path';
import * as fs from 'fs';

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'TinyUrl', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      timeToLiveAttribute: 'expireDate',
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const api = new apigateway.RestApi(this, 'TinyUrlApi');
    api.root.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['OPTIONS, POST'],
    });

    const putItemRole = new iam.Role(this, 'TinyUrlDdbWriteRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    table.grantWriteData(putItemRole);
    const requestModel = api.addModel('RequestModel', {
      contentType: 'application/json',
      modelName: 'TinyUrlRequestModel',
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        required: ['url'],
        properties: {
          url: { ref: '#/definitions/validUrl' },
        },
        definitions: {
          validUrl: { format: 'uri', pattern: '^https?://' },
        },
      },
    });
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
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
          {
            statusCode: '400',
            selectionPattern: '[45]\\d{2}',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
        ],
      },
    });
    api.root.addMethod('POST', putItemIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
      requestModels: {
        'application/json': requestModel,
      },
      requestValidatorOptions: {
        validateRequestBody: true,
      },
    });

    const idResouce = api.root.addResource('{id}');
    const getItemRole = new iam.Role(this, 'TinyUrlDdbReadRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    getItemRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );
    table.grantReadData(getItemRole);

    const getItemHandler = new lambda.Function(this, 'GetItemFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lib/lambda/getItem'),
      environment: { TABLE_NAME: table.tableName },
      role: getItemRole,
    });
    const getItemIntegration = new apigateway.LambdaIntegration(getItemHandler);
    idResouce.addMethod('GET', getItemIntegration);
  }
}
