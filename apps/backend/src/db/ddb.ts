import type { Type } from 'arktype';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB, ScanCommandInput } from '@aws-sdk/client-dynamodb';

import {
    UserSchema,
    type ScheduleSaveState,
} from '@packages/antalmanac-types';
import {backendEnvSchema} from "../env";

/**
 * TODO: enforce this in the schema too, or just leave it as an arbitrary string?
 */
export const VISIBILITY = {
    PRIVATE: 'private',
    PUBLIC: 'public',
    OPEN: 'open',
};

const env = backendEnvSchema.parse(process.env);

class DDBClient<T extends Type<Record<string, unknown>>> {
    private tableName: string;

    private schema: T;

    client: DynamoDB;

    documentClient: DynamoDBDocument;

    constructor(tableName: string, schema: T) {
        if (!tableName) {
            throw new Error('DDBClient(): tableName must be defined');
        }

        this.tableName = tableName;
        this.schema = schema;
        this.client = new DynamoDB({
            region: env.AWS_REGION,
        });
        this.documentClient = DynamoDBDocument.from(this.client, {
            marshallOptions: {
                /**
                 * Some JSON properties may exist and be undefined.
                 * DDB will throw an error unless this is true.
                 *
                 * @example { "property": undefined }
                 */
                removeUndefinedValues: true,
            },
        });
    }

    async get(column: string, id: string): Promise<T['infer'] | undefined> {
        const params = {
            TableName: this.tableName,
            Key: {
                [column]: id,
            },
        };

        const { Item } = await this.documentClient.get(params);

        const { data } = this.schema(Item);

        return data;
    }

    async insertItem(item: T['infer']) {
        await this.documentClient.put({ TableName: this.tableName, Item: item });
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
    
    async getUserData(id: string) {
        return (await ddbClient.get('id', id))?.userData;
    }

    async getGoogleUserData(googleId: string) {
        return (await ddbClient.get('googleId', googleId))?.userData;
    }

    async viewUserData(requesterId: string, requesteeId: string) {
        const existingUserData = await ddbClient.get('id', requesteeId);

        if (existingUserData == null) {
            return undefined;
        }

        const parsedUserData = UserSchema(existingUserData);

        if (parsedUserData.problems != null) {
            return undefined;
        }

        parsedUserData.data.visibility ??= VISIBILITY.PRIVATE;

        // Requester and requestee IDs must match if schedule is private.
        // Otherwise, return the schedule without any additional processing.
        //
        // TODO: when a save request is made,
        // check the schedule's user ID with the user ID making the request
        // to fully define the visibility system.

        if (parsedUserData.data.visibility === VISIBILITY.PRIVATE) {
            return requesterId === requesteeId ? parsedUserData.data : undefined;
        } else {
            return parsedUserData.data;
        }

    }

    /**
     * Reference: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html
     * @returns An async generator that yields batches of user data from DynamoDB pages.
     */
    async* getAllUserDataBatches(){
        const params: ScanCommandInput = {
            TableName: this.tableName,
        }
    
        while(true) {
            const result = await this.documentClient.scan(params);
            
            
            if (result.Items) {
                console.log(`Scanned ${result.Items.length} items`);
                const users = result.Items
                    .map((item) => UserSchema(item))
                    .filter(
                        (result) => (
                            result.problems == null 
                            && result.data != null
                        )
                    )
                    .map((result) => result.data);

                yield users.filter(
                    (user) => user.id !== undefined
                );
            }

            if (typeof result.LastEvaluatedKey === 'undefined') return;

            params.ExclusiveStartKey = result.LastEvaluatedKey;
        }
    }
}

export const ddbClient = new DDBClient(env.USERDATA_TABLE_NAME, UserSchema);
