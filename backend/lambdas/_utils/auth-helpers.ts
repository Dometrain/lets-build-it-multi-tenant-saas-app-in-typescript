import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

export class AuthError extends Error { }

export function getCallingUser(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  if (!event.requestContext?.authorizer?.jwt) throw new Error(`No JWT details in request!`);

  const groupsClaim = event.requestContext.authorizer.jwt.claims['cognito:groups'] as string | undefined ?? "[]";
  // Convert "[sub_123456 mytestgroup]" to ["sub_123456", "mytestgroup"]
  const groups = groupsClaim.replace(/^\[|\]$/g, "")
    .split(" ").map(item => item.trim());

  const userSub = event.requestContext.authorizer.jwt.claims.sub as string;
  return {
    userSub,
    username: event.requestContext.authorizer.jwt.claims.username as string,
    tenantId: groups.find(x => x.startsWith("sub_")) // they might be in a google group or something
  }
}


export async function assumeCallerRole(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const user = getCallingUser(event);
  if (!user.tenantId) throw new AuthError('User is not in a tenant!');
  const roleArn = `arn:aws:iam::${event.requestContext.accountId}:role/TenantAccess_${user.tenantId}`;
  const stsClient = new STSClient({});
  try {
    const command = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: `TenantSession_${user.tenantId}`,
      DurationSeconds: 900
    });

    const response = await stsClient.send(command);
    if (!response.Credentials) throw new AuthError(`No credentials`);
    return {
      tenantId: user.tenantId,
      credentials: response.Credentials
    }
  } catch (error) {
    console.error(error);
    throw new AuthError("Failed to assume role");
  }
}
