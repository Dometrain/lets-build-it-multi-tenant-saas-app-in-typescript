import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from "aws-lambda";
import { AuthError, getCallingUser } from "../_utils/auth-helpers";
import { TenantUser } from '../../../common/types/TenantUser';
import { okResponse, statusCodeResponse } from "../_utils/http-helpers";
import { AdminAddUserToGroupCommand, AdminCreateUserCommand, CognitoIdentityProviderClient, ListUsersInGroupCommand } from "@aws-sdk/client-cognito-identity-provider";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer, context: Context) {
    try {
        const userPoolId = process.env.COGNITO_USER_POOL_ID!;
        const user = getCallingUser(event);
        if (!user.tenantId) throw new AuthError('User is not in a tenant!');

        switch (event.routeKey) {
            case `GET /users`: {
                const cognitoClient = new CognitoIdentityProviderClient({});
                const groupUsers = await cognitoClient.send(new ListUsersInGroupCommand({
                    UserPoolId: userPoolId,
                    GroupName: user.tenantId,
                }));
                const users = groupUsers.Users?.map(x => (<TenantUser>{
                    name: x.Attributes?.find(y => y.Name === "name")!.Value!,
                    email: x.Attributes?.find(y => y.Name === "email")!.Value!
                }));
                return okResponse(users, event);
            }
            case `POST /users`: {
                const newUser = JSON.parse(event.body!) as TenantUser;
                const cognitoClient = new CognitoIdentityProviderClient({});
                const addUserResponse = await cognitoClient.send(new AdminCreateUserCommand({
                    UserPoolId: userPoolId,
                    Username: newUser.email,
                    UserAttributes: [
                        { Name: "email", Value: newUser.email },
                        { Name: "email_verified", Value: "true" },
                        { Name: "name", Value: newUser.name },
                    ]
                }));
                console.log(`Added new user...`);
                console.log(addUserResponse.User);
                await cognitoClient.send(new AdminAddUserToGroupCommand({
                    UserPoolId: userPoolId,
                    Username: addUserResponse.User!.Username!,
                    GroupName: user.tenantId
                }));
                return statusCodeResponse(201, event);
            }
            default:
                return statusCodeResponse(400, event);

        }
    } catch (error) {
        console.error(error);
        if (error instanceof AuthError) {
            return statusCodeResponse(403, event);
        }
        return statusCodeResponse(500, event);
    }
}