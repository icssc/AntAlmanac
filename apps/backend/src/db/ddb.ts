import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import env from '../env';
import { AuthUser, AuthUserSchema, ScheduleSaveState, User, UserSchema } from '@packages/antalmanac-types';

// Initialise DynamoDB Client
const client = new DynamoDB({
    region: 'us-west-1',
});

// Create DynamoDB DocumentClient
const documentClient = DynamoDBDocument.from(client);

class DDBClient<T> {
    private tableName: string;
    private schema: any;

    constructor(tableName: string, schema: any) {
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
        return userData as T;
    }

    async insertItem(item: T) {
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

export const ScheduleCodeClient = new DDBClient<User>(env.USERDATA_TABLE_NAME, UserSchema);
export const AuthUserClient = new DDBClient<AuthUser>(env.AUTH_USERDATA_TABLE_NAME, AuthUserSchema);
