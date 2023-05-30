import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import env from "../env";

// Initialise DynamoDB Client
const client = new DynamoDB({
    region: 'us-east-1',
});

// Create DynamoDB DocumentClient
const documentClient = DynamoDBDocument.from(client);

class DDBClient {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    async getById(id: string) {
        const params = {
            TableName: this.tableName,
            Key: {
                id: id,
            },
        };

        const data = await documentClient.get(params);
        return data.Item;
    }

    async insertById(id: string, item: any): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: {
                id: id,
                ...item
            },
        };

        await documentClient.put(params);
    }
}

export const ScheduleCodeClient = new DDBClient(env.USERDATA_TABLE_NAME);
export const AuthUserClient = new DDBClient(env.AUTH_USERDATA_TABLE_NAME);
