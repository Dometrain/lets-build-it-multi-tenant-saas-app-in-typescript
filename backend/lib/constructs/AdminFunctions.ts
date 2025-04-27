import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AdminLambda, AdminLambdaProps, AdminLambdaRole } from './lambdas/AdminLambda';

type AdminFunctionsProps = {
  userPool: cdk.aws_cognito.UserPool
}

export class AdminFunctions extends Construct {
  lambdaRole: cdk.aws_iam.Role;

  constructor(scope: Construct, id: string, public readonly props: AdminFunctionsProps) {
    super(scope, id);

    this.lambdaRole = new AdminLambdaRole(this, id + 'LambdaRole').role;
  }
  
  addAdminLambda(name: string, props: AdminLambdaProps) {
    new AdminLambda(this, name, { lambdaRole: this.lambdaRole }, props);
  }
}

