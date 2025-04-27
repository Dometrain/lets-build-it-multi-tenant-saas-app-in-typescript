import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from "aws-lambda";
import { AuthError, getCallingUser } from "../_utils/auth-helpers";
import { okResponse, statusCodeResponse } from "../_utils/http-helpers";
import Stripe from 'stripe';
import { CreateCheckoutSessionResponse } from '../../../common/types/api/CreateCheckoutSessionResponse';
import { CognitoIdentityProviderClient, AdminListGroupsForUserCommand, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CreateTenantEvent } from "../admin/create-tenant";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {

    if (event.routeKey === 'POST /stripe') {
        return await processStripeWebhook(event);
    }

    try {
        switch (event.routeKey) {
            case `GET /checkout-session`: {
                return await createCheckoutSession(event);
            }
            default:
                return statusCodeResponse(404, event);

        }
    } catch (error) {
        console.error(error);
        if (error instanceof AuthError) {
            return statusCodeResponse(403, event);
        }
        return statusCodeResponse(500, event);
    }

}

async function processStripeWebhook(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
        maxNetworkRetries: 0
    });
    console.log(event);
    const signatureHeader = event.headers['stripe-signature'];
    if (!signatureHeader) throw new Error(`Invalid signature header!`);
    console.log('Stripe webhook body:');
    console.log(event.body!);
    let webhookEvent: Stripe.Event;
    try {
        webhookEvent = stripe.webhooks.constructEvent(event.body!, signatureHeader, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (e) {
        console.error(`Error verifying webhook body signature from stripe`);
        return statusCodeResponse(401, event);
    }
    if (webhookEvent.data.object.object !== "subscription") {
        console.error(`Expected event object to be a subscription but found ${webhookEvent.data.object.object}`);
        return statusCodeResponse(400, event);
    }
    switch (webhookEvent.type) {
        case "customer.subscription.created":
            const stripeCustomerId = webhookEvent.data.object.customer as string;
            const stripeCustomer = (await stripe.customers.retrieve(stripeCustomerId) as Stripe.Response<Stripe.Customer>);
            console.log(stripeCustomer);
            const payload: CreateTenantEvent = {
                email: stripeCustomer.email!,
                tenantId: webhookEvent.data.object.id
            };
            const response = await new LambdaClient({}).send(new InvokeCommand({
                FunctionName: `admin-create-tenant`,
                Payload: Buffer.from(JSON.stringify(payload)),
                InvocationType: "RequestResponse"
            }));
            console.log(response);
            return statusCodeResponse(response.StatusCode!, event);
        default:
            console.error("Was not expecting the event " + webhookEvent.type);
            return statusCodeResponse(400, event);
    }
}

async function createCheckoutSession(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const user = getCallingUser(event);
    if (user.tenantId) return statusCodeResponse(409, event);
    const userPoolId = process.env.COGNITO_USER_POOL_ID!;
    const cognitoClient = new CognitoIdentityProviderClient({});
    const groups = await cognitoClient.send(new AdminListGroupsForUserCommand({
        UserPoolId: userPoolId,
        Username: user.username
    }));
    const tenantGroups = groups.Groups?.filter(x => x.GroupName?.startsWith('sub_')) ?? [];
    if (tenantGroups.length > 0) return statusCodeResponse(409, event);

    const cognitoUser = await cognitoClient.send(new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: user.username
    }));

    const email = cognitoUser.UserAttributes!.find(x => x.Name === "email")!.Value!;

    const sessionCreateParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        customer_email: email,
        client_reference_id: user.username,
        line_items: [
            {
                price: process.env.STRIPE_PRICE_ID!,
                quantity: 1,
            },
        ],
        ui_mode: 'embedded',
        return_url: `https://${process.env.DOMAIN_NAME}/checkout-complete/?sid={CHECKOUT_SESSION_ID}`,
        payment_method_collection: 'always',
    }
    console.log(sessionCreateParams);

    const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
        maxNetworkRetries: 0
    });

    const session = await stripe.checkout.sessions.create(sessionCreateParams);
    console.log(session);
    return okResponse(<CreateCheckoutSessionResponse>{
        sessionId: session.id,
        secret: session.client_secret!
    }, event);
}