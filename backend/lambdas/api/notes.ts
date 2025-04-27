import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from "aws-lambda";
import { AuthError, assumeCallerRole, getCallingUser } from "../_utils/auth-helpers";
import { createDbClient } from "../_utils/db-helpers";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Note } from '../../../common/types/Note';
import { okResponse, statusCodeResponse } from "../_utils/http-helpers";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer, context: Context) {
    try {
        const caller = await assumeCallerRole(event);

        switch (event.routeKey) {
            case `GET /notes`: {
                const dbResult = await createDbClient(caller.credentials).send(
                    new ScanCommand({
                        TableName: `${caller.tenantId}_notes`,
                    }));
                const notes = dbResult.Items?.map(x => x as Note) ?? [];
                return okResponse(notes, event);
            }
            case `PUT /notes/{id}`: {
                const newNote = JSON.parse(event.body!) as Note;
                await createDbClient(caller.credentials).send(new PutCommand({
                    TableName: `${caller.tenantId}_notes`,
                    Item: newNote
                }));
                return statusCodeResponse(200, event);
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