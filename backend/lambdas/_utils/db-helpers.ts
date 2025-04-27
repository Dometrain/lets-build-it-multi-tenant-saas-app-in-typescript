import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Credentials } from "@aws-sdk/client-sts";

export function createDbClient(credentials: Credentials) {
    return new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: credentials.AccessKeyId!,
            secretAccessKey: credentials.SecretAccessKey!,
            sessionToken: credentials.SessionToken!
        }
    });
}