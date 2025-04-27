import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';

type CognitoPoolsProps = {
  domainName: string,
  hostedZone: cdk.aws_route53.IHostedZone;
  certificate: cdk.aws_certificatemanager.ICertificate;
}

export class CognitoPools extends Construct {
  readonly userPool: cdk.aws_cognito.UserPool;
  readonly webClient: cdk.aws_cognito.UserPoolClient;
  readonly identityPool: cdk.aws_cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: CognitoPoolsProps) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, id + 'UserPool', {
      userPoolName: 'saas-users',
      selfSignUpEnabled: true,
      standardAttributes: {
        email: { required: true, mutable: true },
        fullname: { required: true, mutable: true },
      },
      signInAliases: { email: true },
      mfa: cognito.Mfa.OFF,
      email: cognito.UserPoolEmail.withCognito(),
      signInCaseSensitive: false,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireDigits: false,
        requireSymbols: false,
        requireUppercase: false,
        tempPasswordValidity: cdk.Duration.days(7),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    this.webClient = new cognito.UserPoolClient(this, id + 'UserPoolClient', {
      userPool: this.userPool,
      enableTokenRevocation: false,
      userPoolClientName: 'saas-web-client',
      authFlows: {
        userPassword: true
      },
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],  // Add in Google etc here
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE
        ],
        callbackUrls: [`https://${props.domainName}/app/notes`, `http://localhost:5173/app/notes`],
        logoutUrls: [`https://${props.domainName}/logout`],
      },
      refreshTokenValidity: cdk.Duration.days(30),
      idTokenValidity: cdk.Duration.minutes(60),
      accessTokenValidity: cdk.Duration.minutes(60),
    });


    // Identity Pool
    this.identityPool = new cognito.CfnIdentityPool(this, id + 'IdentityPool', {
      identityPoolName: 'saas-identities',
      allowUnauthenticatedIdentities: false,
      allowClassicFlow: true,
      cognitoIdentityProviders: [
        {
          providerName: this.userPool.userPoolProviderName,
          clientId: this.webClient.userPoolClientId,
          serverSideTokenCheck: false,
        }
      ],
    });

    const defaultCognitoRole = new iam.Role(this, id + 'DefaultRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          "StringEquals": { "cognito-identity.amazonaws.com:aud": this.identityPool.ref },
          "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "authenticated" }
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
      ]
    });

    new cognito.CfnIdentityPoolRoleAttachment(this, id + 'IPRoleAttachment', {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: defaultCognitoRole.roleArn, // Default role (will be replaced dynamically)
      },
      roleMappings: {
        cognitoRoleMapping: {
          type: 'Token',
          ambiguousRoleResolution: 'AuthenticatedRole',
          identityProvider: `cognito-idp.${cdk.Aws.REGION}.amazonaws.com/${this.userPool.userPoolId}:${this.webClient.userPoolClientId}`,
        },
      },
    });


    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: this.userPool.userPoolId,
      exportName: 'CognitoUserPoolId',
    });

    new cdk.CfnOutput(this, 'CognitoWebClientId', {
      value: this.webClient.userPoolClientId,
      exportName: 'CognitoWebClientId',
    });

  }
}
