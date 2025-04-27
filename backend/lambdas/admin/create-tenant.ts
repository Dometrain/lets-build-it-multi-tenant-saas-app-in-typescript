import { createGroupForUser, findUserByEmail } from "../_utils/cognito-helpers";
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { IAMClient, CreateRoleCommand, PutRolePolicyCommand } from "@aws-sdk/client-iam";
import { Context } from "aws-lambda";

export type CreateTenantEvent = {
  email: string,
  tenantId: string
}

export async function handler(event: CreateTenantEvent, context: Context) {

  const accountId = context.invokedFunctionArn.split(':')[4];

  const userPoolId = process.env.COGNITO_USER_POOL_ID!;

  const cognitoUser = await findUserByEmail(userPoolId, event.email);

  const tableName = `${event.tenantId}_notes`;
  await new DynamoDBClient({}).send(new CreateTableCommand({
    TableName: tableName,
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" }
    ],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    BillingMode: "PAY_PER_REQUEST"
  }));


  const roleName = `TenantAccess_${event.tenantId}`;
  const iamClient = new IAMClient({});
  await iamClient.send(new CreateRoleCommand({
    RoleName: roleName,
    AssumeRolePolicyDocument: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: `arn:aws:iam::${accountId}:role/ApiLambdaRole` },
          Action: "sts:AssumeRole"
        }
      ]
    })
  }));

  await iamClient.send(new PutRolePolicyCommand({
    RoleName: roleName,
    PolicyName: `TenantDynamoDBAccess-${event.tenantId}`,
    PolicyDocument: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Scan", "dynamodb:Query"],
          Resource: `arn:aws:dynamodb:*:*:table/${tableName}`
        }
      ]
    })
  }));


  await createGroupForUser(userPoolId, cognitoUser.Username!, event.tenantId);

  return 'ok';
}
