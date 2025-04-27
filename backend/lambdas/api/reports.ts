import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { AuthError, assumeCallerRole } from "../_utils/auth-helpers";
import { createDbClient } from "../_utils/db-helpers";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Note } from '../../../common/types/Note';
import { ReportData } from '../../../common/types/ReportData';
import { okResponse, statusCodeResponse } from "../_utils/http-helpers";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    try {
        const caller = await assumeCallerRole(event);

        const dbResult = await createDbClient(caller.credentials).send(
            new ScanCommand({
                TableName: `${caller.tenantId}_notes`,
            }));
        const notes = dbResult.Items?.map(x => x as Note) ?? [];

        const contributions = notes.reduce<{ [name: string]: number}>(
            (acc, cur) => {
                acc[cur.author] ? acc[cur.author]++ : acc[cur.author] = 1;
                return acc;
            }, {});

        const sortedContributions = Object.entries(contributions)
                                    .toSorted((x, y) => y[1] - x[1]);

        const result: ReportData = {
            noteCount: notes.length,
            mostNotableUser: sortedContributions.length ? sortedContributions[0][0] : 'Nobody'
        };
        return okResponse(result, event);
    } catch (error) {
        console.error(error);
        if (error instanceof AuthError) {
            return statusCodeResponse(403, event);
        }
        return statusCodeResponse(500, event);
    }
}