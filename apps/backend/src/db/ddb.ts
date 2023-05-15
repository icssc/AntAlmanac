import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

import dotenv from "dotenv";

dotenv.config();

// Initialise DynamoDB Client
const client = new DynamoDB({
    region: "us-east-1",
})

// Create DynamoDB DocumentClient
const documentClient = DynamoDBDocument.from(client);

const TABLENAME = process.env.USERDATA_TABLE_NAME!;

async function getById(id: string): Promise<any> {
    const params = {
        TableName: TABLENAME,
        Key: {
            id: id,
        },
    };

    const data = await documentClient.get(params);
    return data.Item;
}

async function insertById(id: string, userData: string): Promise<void> {
    const params = {
        TableName: TABLENAME,
        Item: {
            id: id,
            userData: userData,
        },
    };

    await documentClient.put(params);
}

export { getById, insertById };
