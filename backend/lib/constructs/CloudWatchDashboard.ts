import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

type CloudWatchDashboardProps = {
  httpApi: cdk.aws_apigatewayv2.HttpApi,
  userPool: cdk.aws_cognito.UserPool
}

export class CloudWatchDashboard extends Construct {
  dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, public readonly props: CloudWatchDashboardProps) {
    super(scope, id);

    this.dashboard = new cloudwatch.Dashboard(this, 'CWDashboard', {
      dashboardName: 'SaaS-Dashboard',
    });

    const apiMetric = props.httpApi.metricCount({
      statistic: 'Sum',
      period: cdk.Duration.hours(6),
    });

    const cognitoSignupsMetric = new cloudwatch.Metric({
      namespace: 'AWS/Cognito',
      metricName: 'SignInSuccesses',
      dimensionsMap: { UserPoolId: props.userPool.userPoolId },
      statistic: 'Sum',
      period: cdk.Duration.hours(6),
    });

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway Traffic',
        width: 6,
        height: 6,
        left: [apiMetric],
      }),
      new cloudwatch.GraphWidget({
        title: 'Cognito Signups',
        width: 6,
        height: 6,
        left: [cognitoSignupsMetric],
      })
    );
  }
}
