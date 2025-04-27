import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ServerlessApi } from './constructs/ServerlessApi';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { CognitoPools } from './constructs/CognitoPools';
import { AdminFunctions } from './constructs/AdminFunctions';
import { CloudWatchDashboard } from './constructs/CloudWatchDashboard';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';

export interface BackEndStackProps extends cdk.StackProps {
  readonly domainName: string;
  readonly hostedZoneId: string
  readonly localEnv: EnvVars;
}

export type EnvVars = {
  STRIPE_PUBLIC_KEY: string,
  STRIPE_PRIVATE_KEY: string,
  STRIPE_WEBHOOK_SECRET: string,
  STRIPE_PRICE_ID: string
}

export class BackEndStack extends cdk.Stack {
  public readonly certificate: certificatemanager.ICertificate;
  public readonly userPool: cdk.aws_cognito.UserPool;
  public readonly hostedZone: cdk.aws_route53.IHostedZone;

  constructor(scope: Construct, id: string, props: BackEndStackProps) {
    super(scope, id, props);

    const { domainName } = props;

    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: domainName,
    });

    this.certificate = new acm.Certificate(this, 'WebHostingCertificate', {
      domainName: domainName,
      subjectAlternativeNames: [`api.${props.domainName}`, `auth.${props.domainName}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    const cognito = new CognitoPools(this, 'Cognito', {
      domainName: props.domainName,
      hostedZone: this.hostedZone,
      certificate: this.certificate
    });
    this.userPool = cognito.userPool;

    const serverlessApi = new ServerlessApi(this, 'Api', {
      certificate: this.certificate,
      domainName,
      hostedZone: this.hostedZone,
      env: props.localEnv,
      userPool: cognito.userPool,
      userPoolClients: [cognito.webClient],
    });

    serverlessApi.addLambdaRoute('NotesEndpoint', {
      functionName: 'notes',
      routes: [{
        // makes this lambda equivalent to a Controller in MVC, you could split out GET
        // There are no rules in software engineering, except for all the rules.
        methods: [HttpMethod.GET],
        path: '/notes'
      },
      {
        methods: [HttpMethod.PUT],
        path: '/notes/{id}'
      }]
    });

    serverlessApi.addLambdaRoute('ReportsEndpoint', {
      functionName: 'reports',
      routes: [{
        methods: [HttpMethod.GET],
        path: '/reports'
      }]
    });

    serverlessApi.addLambdaRoute('UsersEndpoint', {
      functionName: 'users',
      routes: [{
        methods: [HttpMethod.GET, HttpMethod.POST],
        path: '/users'
      }],
      overrides: {
        environment: {
          COGNITO_USER_POOL_ID: cognito.userPool.userPoolId
        }
      }
    });

    serverlessApi.addLambdaRoute('StripeEndpoint', {
      functionName: 'stripe',
      routes: [{
        methods: [HttpMethod.POST],
        path: '/stripe',
        isAnonymous: true
      },
      {
        methods: [HttpMethod.GET],
        path: '/checkout-session'
      }],
      nodeModulesToInclude: ['stripe'],
      overrides: {
        environment: {
          STRIPE_PUBLIC_KEY: props.localEnv.STRIPE_PUBLIC_KEY,
          STRIPE_PRIVATE_KEY: props.localEnv.STRIPE_PRIVATE_KEY,
          STRIPE_WEBHOOK_SECRET: props.localEnv.STRIPE_WEBHOOK_SECRET,
          COGNITO_USER_POOL_ID: cognito.userPool.userPoolId,
          STRIPE_PRICE_ID: props.localEnv.STRIPE_PRICE_ID
        }
      }
    });


    const adminFunctions = new AdminFunctions(this, 'AdminFns', { userPool: cognito.userPool });
    adminFunctions.node.addDependency(cognito);
    adminFunctions.addAdminLambda('CreateTenant', {
      functionName: 'create-tenant',
      nodeModulesToInclude: ['nanoid'],
      overrides: {
        environment: {
          COGNITO_USER_POOL_ID: this.userPool.userPoolId,
        },
      }
    });

    new CloudWatchDashboard(this, 'CloudWatchDashboard', {
      httpApi: serverlessApi.api,
      userPool: cognito.userPool
    });


  }
}
