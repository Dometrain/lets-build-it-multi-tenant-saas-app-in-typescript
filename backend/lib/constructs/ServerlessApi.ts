import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { ARecord } from 'aws-cdk-lib/aws-route53';
import { aws_route53_targets as targets } from 'aws-cdk-lib';
import { CorsHttpMethod, DomainName, HttpApi, SecurityPolicy } from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2Authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { ApiLambdaRole, ApiRouteLambda, ApiRouteLambdaProps } from './lambdas/ApiRouteLambda';
import { EnvVars } from '../BackEndStack';

type ServerlessApiProps = {
  domainName: string;
  certificate: cdk.aws_certificatemanager.ICertificate;
  hostedZone: route53.IHostedZone;
  userPool: cdk.aws_cognito.IUserPool,
  userPoolClients: cdk.aws_cognito.UserPoolClient[],
  env: EnvVars
}

export class ServerlessApi extends Construct {
  public readonly api: cdk.aws_apigatewayv2.HttpApi;
  public readonly authorizer: cdk.aws_apigatewayv2_authorizers.HttpUserPoolAuthorizer;
  lambdaDeps: { 
    lambdaRole: cdk.aws_iam.Role; 
    api: cdk.aws_apigatewayv2.HttpApi; 
    domainName: string; 
    authorizer: cdk.aws_apigatewayv2_authorizers.HttpUserPoolAuthorizer; 
  };

  constructor(scope: Construct, id: string, public readonly props: ServerlessApiProps) {
    super(scope, id);

    const domainName = new DomainName(this, 'ApiDomainName', {
      domainName: `api.${props.domainName}`,
      certificate: props.certificate,
      securityPolicy: SecurityPolicy.TLS_1_2,
    });

    this.api = new HttpApi(this, 'HttpApi', {
      apiName: 'SaasApi',
      corsPreflight: {
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.PUT, CorsHttpMethod.POST, CorsHttpMethod.PATCH, CorsHttpMethod.DELETE],
        allowOrigins: ['*']
      },
      defaultDomainMapping: {
        domainName
      }
    });

    new ARecord(this, 'ApiARecord', {
      zone: props.hostedZone,
      recordName: 'api',
      target: route53.RecordTarget.fromAlias(new targets.ApiGatewayv2DomainProperties(domainName.regionalDomainName, domainName.regionalHostedZoneId))
    });

    this.authorizer = new apigatewayv2Authorizers.HttpUserPoolAuthorizer('ApiCognitoAuthorizer', props.userPool, {
      userPoolClients: props.userPoolClients
    });

    const lambdaRole = new ApiLambdaRole(this, 'LambdaRole').role;

    this.lambdaDeps = {
      lambdaRole: lambdaRole,
      api: this.api,
      domainName: props.domainName,
      authorizer: this.authorizer
    };
  }


  addLambdaRoute(name: string, props: ApiRouteLambdaProps) {
    new ApiRouteLambda(this, name, this.lambdaDeps, props);
  }
}

