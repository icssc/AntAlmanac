import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

import { ScheduleSaveState, User, UserSchema } from '@packages/antalmanac-types';
import env from '../env';

// Initialise DynamoDB Client
const client = new DynamoDB({
    region: env.AWS_REGION,
});

// Create DynamoDB DocumentClient
const documentClient = DynamoDBDocument.from(client, {
    marshallOptions: {
        /**
         * Some JSON properties may exist and be undefined; DDB will throw an error unless this is true.
         * @example { "property": undefined }
         */
        removeUndefinedValues: true,
    },
});

class DDBClient<T extends Record<string, any>> {
    private tableName: string;
    private schema: any;

    constructor(tableName: string, schema: any) {
        this.tableName = tableName;
        this.schema = schema;
    }

    async get(id: string): Promise<T | undefined> {
        const params = {
            TableName: this.tableName,
            Key: {
                id: id,
            },
        };

        const { Item } = await documentClient.get(params);
        const { data, problems } = this.schema(Item);
        return problems === undefined ? data : undefined;
    }

    async insertItem(item: T) {
        await documentClient.put({
            TableName: this.tableName,
            Item: item,
        });
    }

    async updateSchedule(id: string, schedule: ScheduleSaveState) {
        const params = {
            TableName: this.tableName,
            Key: {
                id: id,
            },
            UpdateExpression: 'set userData = :u',
            ExpressionAttributeValues: {
                ':u': schedule,
            },
        };
        await documentClient.update(params);
    }
}

export const ScheduleCodeClient = new DDBClient<User>(env.USERDATA_TABLE_NAME, UserSchema);
