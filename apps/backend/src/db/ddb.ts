import { DynamoDB } from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const documentClient = new DynamoDB.DocumentClient({ region: process.env.AWS_REGION });
const TABLENAME = process.env.USERDATA_TABLE_NAME!;

function callback(err: any, data?: any): void {
    if (err) {
        console.error('Error', err);
    } else {
        console.log('Success');
    }
}

async function getById(id: string): Promise<DynamoDB.DocumentClient.AttributeMap | undefined> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
        TableName: TABLENAME,
        Key: {
            id: id,
        },
    };

    const data: DynamoDB.DocumentClient.GetItemOutput = await documentClient.get(params, callback).promise();
    return data.Item;
}

async function insertById(id: string, userData: string): Promise<void> {
    const params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: TABLENAME,
        Item: {
            id: id,
            userData: userData,
        },
    };

    await documentClient.put(params, callback).promise();
}

export { getById, insertById };
