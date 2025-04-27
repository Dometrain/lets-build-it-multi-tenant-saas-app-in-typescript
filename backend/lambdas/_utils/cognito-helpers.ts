import { AdminAddUserToGroupCommand, CognitoIdentityProviderClient, CreateGroupCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

export async function findUserByEmail(userPoolId: string, email: string) {
    const cognitoClient = new CognitoIdentityProviderClient({});

    const getCognitoUserResponse = await cognitoClient.send(new ListUsersCommand({
        UserPoolId: userPoolId,
        AttributesToGet: ["email", "sub", "name"],
        Filter: `email = \"${email}\"`,
    }));

    if (!getCognitoUserResponse.Users?.length) {
        throw new Error(`Could not find user in Cognito with email ${email}`);
    } else if (getCognitoUserResponse.Users.length > 1) {
        throw new Error(`Found more than one user with email ${email} in cognito!`);
    }

    const cognitoUser = getCognitoUserResponse.Users![0];
    if (cognitoUser.UserStatus === 'UNCONFIRMED') {
        throw new Error(`The user ${email} is in ${cognitoUser.UserStatus} state!`);
    }

    return cognitoUser;
}

export async function createGroupForUser(userPoolId: string, userName: string, groupName: string) {
    const cognitoClient = new CognitoIdentityProviderClient({});

    await cognitoClient.send(new CreateGroupCommand({
        UserPoolId: userPoolId,
        GroupName: groupName,
    }));

    await cognitoClient.send(new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: userName,
        GroupName: groupName
    }));
}