import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

import dotenv from 'dotenv';
import { ScheduleSaveState } from 'antalmanac-types';

dotenv.config();

// Initialise DynamoDB Client
const client = new DynamoDB({
    region: 'us-east-1',
});

// Create DynamoDB DocumentClient
const documentClient = DynamoDBDocument.from(client);

const TABLENAME = import.meta.env.USERDATA_TABLE_NAME;

async function getById(id: string){
    const params = {
        TableName: TABLENAME,
        Key: {
            id: id,
        },
    };

    const data = await documentClient.get(params);
    return data.Item;
}

async function insertById(id: string, userData: ScheduleSaveState) {
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
