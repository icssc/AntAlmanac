import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

import { ScheduleSaveState, User, UserSchema } from '@packages/antalmanac-types';
import env from '../env';

class DDBClient<T extends Record<string, any>> {
    // Initialise DynamoDB Client
    client: DynamoDB;

    // Create DynamoDB DocumentClient
    documentClient: DynamoDBDocument;

    private tableName: string;
    private schema: any;

    constructor(tableName: string, schema: any) {
        this.client = new DynamoDB({
            region: env.AWS_REGION,
        });

        // Create DynamoDB DocumentClient
        this.documentClient = DynamoDBDocument.from(this.client, {
            marshallOptions: {
                /**
                 * Some JSON properties may exist and be undefined; DDB will throw an error unless this is true.
                 * @example { "property": undefined }
                 */
                removeUndefinedValues: true,
            },
        });
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

        const { Item } = await this.documentClient.get(params);
        const { data, problems } = this.schema(Item);
        return problems === undefined ? data : undefined;
    }

    async insertItem(item: T) {
        await this.documentClient.put({
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
        await this.documentClient.update(params);
    }
}

export const ScheduleCodeClient = new DDBClient<User>(env.USERDATA_TABLE_NAME, UserSchema);
