import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StaticWebsite } from './constructs/StaticWebsite';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import { CognitoHostedUI } from './constructs/CognitoHostedUI';
import { readStackOutput } from '../utils/read-stack-outputs';
import { buildFrontEnd } from '../utils/build-frontend';

export interface FrontEndStackProps extends cdk.StackProps {
  readonly domainName: string;
  readonly backendStackName: string,
  readonly hostedZone: cdk.aws_route53.IHostedZone,
  readonly certificate: certificatemanager.ICertificate;
  readonly localEnv: EnvVars;
}

export type EnvVars = {
  STRIPE_PUBLIC_KEY: string,
}

export class FrontEndStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontEndStackProps) {
    super(scope, id, props);

    const frontendPath = '../frontend';

    const userPoolId = readStackOutput(props.backendStackName, 'CognitoUserPoolId');
    const webClientId = readStackOutput(props.backendStackName, 'CognitoWebClientId');

    if (userPoolId && webClientId) {
      buildFrontEnd(frontendPath, { 
        userPoolId, 
        webClientId, 
        domainName: props.domainName, 
        stripePublicKey: props.localEnv.STRIPE_PUBLIC_KEY
      });

      const frontend = new StaticWebsite(this, 'FrontEnd', {
        certificate: props.certificate,
        domainName: props.domainName,
        hostedZone: props.hostedZone,
        frontendPath: `${frontendPath}/dist`,
      });

      const hostedUi = new CognitoHostedUI(this, 'HostedUI', {
        certificate: props.certificate,
        domainName: props.domainName,
        hostedZone: props.hostedZone,
        userPoolId,
        webClientId,
        pathToCssFile: '../cognito.css'
      });
      // The hosted UI needs an A record creating first, which is done by the StaticWebsite construct
      hostedUi.node.addDependency(frontend);
    }
  }
}
