import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as fs from 'fs';
import * as path from 'path';

type CognitoHostedUIProps = {
    domainName: string,
    userPoolId: string,
    webClientId: string,
    hostedZone: cdk.aws_route53.IHostedZone;
    certificate: cdk.aws_certificatemanager.ICertificate;
    pathToCssFile: string
}

export class CognitoHostedUI extends Construct {
    readonly userPool: cdk.aws_cognito.UserPool;
    readonly webClient: cdk.aws_cognito.UserPoolClient;
    readonly identityPool: cdk.aws_cognito.CfnIdentityPool;

    constructor(scope: Construct, id: string, props: CognitoHostedUIProps) {
        super(scope, id);

        const userPool = cognito.UserPool.fromUserPoolId(this, 'CreatedUserPool', props.userPoolId);

        const userPoolDomain = userPool.addDomain(id + 'CustomDomain', {
            customDomain: {
                domainName: `auth.${props.domainName}`,
                certificate: props.certificate,
            },
        });

        const cnameRecord = new route53.CnameRecord(this, id + 'CognitoDomainCname', {
            zone: props.hostedZone,
            recordName: `auth.${props.domainName}`,
            domainName: userPoolDomain.cloudFrontEndpoint,
        });
        cnameRecord.node.addDependency(userPoolDomain);

        const cssFilePath = path.join(__dirname, '../', props.pathToCssFile);
        const cssContent = fs.readFileSync(cssFilePath, 'utf8');
        // Allowed classes here:
        //https://docs.aws.amazon.com/cognito/latest/developerguide/hosted-ui-classic-branding.html
        const userPoolCustomisation = new cognito.CfnUserPoolUICustomizationAttachment(this, 'UICustomization', {
            clientId: props.webClientId,
            userPoolId: props.userPoolId,
            css: cssContent,
        });
        userPoolCustomisation.node.addDependency(cnameRecord);

    }
}