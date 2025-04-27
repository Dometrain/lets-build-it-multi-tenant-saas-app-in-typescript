import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';

export type ApiRouteLambdaProps = {
    functionName: string,
    routes: { path: string, methods: apigatewayv2.HttpMethod[], isAnonymous?: boolean }[],
    nodeModulesToInclude?: string[],
    overrides?: lambdaNodejs.NodejsFunctionProps
}

export class ApiRouteLambda extends Construct {

    constructor(scope: Construct,
        id: string,
        deps: {
            lambdaRole: iam.Role,
            api: apigatewayv2.HttpApi,
            authorizer: apigatewayv2.IHttpRouteAuthorizer,
            domainName: string
        },
        props: ApiRouteLambdaProps) {
        super(scope, id);

        const nodeJsFunction = new lambdaNodejs.NodejsFunction(this, id + 'Fn', {
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: `./lambdas/api/${props.functionName}.ts`,
            handler: 'handler',
            role: deps.lambdaRole,
            timeout: cdk.Duration.seconds(30),
            functionName: 'api-' + props.functionName,
            architecture: lambda.Architecture.ARM_64,
            bundling: {
                minify: false,
                target: 'es2020',
                sourceMap: false,
                externalModules: ['@aws-sdk/*'],
                nodeModules: [...(props.nodeModulesToInclude ?? [])]
            },
            ...props.overrides,
            environment: {
                ...props.overrides?.environment,
                DOMAIN_NAME: deps.domainName
            }
        });

        const lambdaIntegration = new HttpLambdaIntegration(id + 'Integration', nodeJsFunction);

        for (let route of props.routes) {
            deps.api.addRoutes({
                path: route.path,
                methods: route.methods,
                integration: lambdaIntegration,
                ...(!route.isAnonymous && {
                    authorizer: deps.authorizer,
                })
            });
        }

        new logs.LogGroup(this, id + 'LogGroup', {
            logGroupName: `/aws/lambda/api-${props.functionName}`,
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
    }

}

export class ApiLambdaRole extends Construct {
    readonly role: iam.Role;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.role = new iam.Role(this, id + "Role", {
            roleName: "ApiLambdaRole",
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
            ],
            inlinePolicies: {
                LambdaRoleInlinePolicy: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: ["cognito-idp:*"],
                            resources: ["*"],
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: ["lambda:InvokeFunction"],
                            resources: [
                                `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:*`
                            ]
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: ["sts:AssumeRole"],
                            resources: [`arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:role/TenantAccess_sub_*`]
                        })
                    ]
                })
            }
        });
    }
}
