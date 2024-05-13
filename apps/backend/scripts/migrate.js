import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb'; // ES Modules import
import env from '../src/env';

async function main() {
    const client = new DynamoDBClient({
        region: env.AWS_REGION,
    });

    const input = {
        // DescribeTableInput
        TableName: env.USERDATA_TABLE_NAME, // required
    };

    const command = new DescribeTableCommand(input);
    const response = await client.send(command);

    console.log(response);
}

main();
