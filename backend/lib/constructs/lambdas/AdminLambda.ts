import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';

export type AdminLambdaProps = {
    functionName: string,
    nodeModulesToInclude?: string[],
    overrides?: lambdaNodejs.NodejsFunctionProps
}

export class AdminLambda extends Construct {

    constructor(scope: Construct,
        id: string,
        deps: {
            lambdaRole: iam.Role,
        },
        props: AdminLambdaProps) {
        super(scope, id);

        new lambdaNodejs.NodejsFunction(this, id + 'Fn', {
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: `./lambdas/admin/${props.functionName}.ts`,
            handler: 'handler',
            role: deps.lambdaRole,
            timeout: cdk.Duration.seconds(30),
            functionName: 'admin-' + props.functionName,
            architecture: lambda.Architecture.ARM_64,
            bundling: {
                minify: false,
                target: 'es2020',
                sourceMap: false,
                externalModules: ['@aws-sdk/*'],
                nodeModules: [...(props.nodeModulesToInclude ?? [])]
            },
            ...props.overrides
        });

        new logs.LogGroup(this, id + 'LogGroup', {
            logGroupName: `/aws/lambda/admin-${props.functionName}`,
            retention: logs.RetentionDays.SIX_MONTHS,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
    }

}


export class AdminLambdaRole extends Construct {

    readonly role: iam.Role;

    constructor(scope: Construct, id: string) {
        super(scope, id);
        // IAM Role
        this.role = new Role(this, id + 'Role', {
            roleName: 'AdminLambdaRole',
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
            ]
        });
    }
}
