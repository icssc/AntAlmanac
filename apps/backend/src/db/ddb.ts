import type { Type } from 'arktype';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

import { GoogleUserSchema, ScheduleSaveState, UserSchema } from '@packages/antalmanac-types';
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

class DDBClient<T extends Type<any>> {
    private tableName: string;
    private schema: any;

    constructor(tableName: string, schema: T) {
        this.tableName = tableName;
        this.schema = schema;
    }

    async get(id: string) {
        const params = {
            TableName: this.tableName,
            Key: {
                id: id,
            },
        };

        const data = await documentClient.get(params);
        const { data: userData, problems } = this.schema(data.Item);
        if (problems !== undefined) {
            return undefined;
        }
        return userData as T['infer'];
    }

    async insertItem(item: T['infer']) {
        const params = {
            TableName: this.tableName,
            Item: item as any,
        };
        await documentClient.put(params);
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

export const ScheduleCodeClient = new DDBClient(env.USERDATA_TABLE_NAME, UserSchema);

export const AuthUserClient = new DDBClient(env.AUTH_USERDATA_TABLE_NAME, GoogleUserSchema);
