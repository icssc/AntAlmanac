import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

import { ScheduleSaveState } from '@packages/antalmanac-types';
import env from '../env';

// Initialise DynamoDB Client
const client = new DynamoDB({
    region: env.AWS_REGION,
});

// Create DynamoDB DocumentClient
const documentClient = DynamoDBDocument.from(client, {
    marshallOptions: {
        removeUndefinedValues: true
    }
});

const TABLENAME = env.USERDATA_TABLE_NAME;

async function getById(id: string) {
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
