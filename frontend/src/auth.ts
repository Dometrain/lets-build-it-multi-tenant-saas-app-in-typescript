import { AuthUser, fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { CurrentUser } from '@common/types/CurrentUser';

export function configureAuth() {
    Amplify.configure({
        Auth: {
            Cognito: {
                userPoolClientId: import.meta.env.VITE_WEB_CLIENT_ID,
                userPoolId: import.meta.env.VITE_USER_POOL_ID,
                mfa: {
                    status: "off"
                },
                passwordFormat: {
                    minLength: 8,
                    requireLowercase: false,
                    requireNumbers: false,
                    requireSpecialCharacters: false,
                    requireUppercase: false
                },
                loginWith: {
                    oauth: {
                        domain: `auth.${import.meta.env.VITE_DOMAIN_NAME}`,
                        redirectSignIn: [`https://${import.meta.env.VITE_DOMAIN_NAME}/app/notes`, `http://localhost:5173/app/notes`],
                        redirectSignOut: [`https://${import.meta.env.VITE_DOMAIN_NAME}/logout`],
                        responseType: "code",
                        scopes: [
                            "email",
                            "openid",
                            "profile"
                        ],
                    }
                }
            }
        }
    });
}

export async function getCognitoUser() {
    if (import.meta.env.VITE_MOCK_DATA === "true") {
        return {
            userId: 'userid',
            username: 'me@example.com',
        } as AuthUser;
    }
    try {
        const result = await getCurrentUser();
        return result;
    } catch (e: any) {
        if (e.name === "UserUnAuthenticatedException" || e === "not authenticated" || e === "The user is not authenticated" || e.toString().includes('not authenticated')) {
            return undefined;
        } else {
            throw e;
        }
    }
}


export async function getLoggedInUser() {
    if (import.meta.env.VITE_MOCK_DATA === "true") {
        return {
            accessToken: "TOKEN",
            email: "me@example.com",
            name: "Bob",
            tenantId: "sub_123456"
        } as CurrentUser;
    }
    const authSession = await fetchAuthSession();
    if (!authSession.tokens) return null;
    console.log(authSession.tokens);
    const userGroups = authSession.tokens.idToken?.payload['cognito:groups'] as string[];
    const tenantId = userGroups?.find(x => x.startsWith("sub_"));
    const email = authSession.tokens.idToken?.payload.email;
    const name = authSession.tokens.idToken?.payload.name;
    return {
        accessToken: authSession.tokens.accessToken.toString(),
        email,
        name,
        tenantId
    } as CurrentUser
}