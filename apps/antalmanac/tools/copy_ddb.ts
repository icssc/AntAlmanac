import { DynamoDB } from 'aws-sdk';
import { Key, WriteRequest } from 'aws-sdk/clients/dynamodb';

interface CopyProps {
    sourceTableName: string;
    sourceDdbClient: DynamoDB.DocumentClient;
    sourceDdb: DynamoDB;
    destinationTableName: string;
    destinationDdbClient: DynamoDB.DocumentClient;
    destinationDdb: DynamoDB;
}

async function main() {
    const config: DynamoDB.ClientConfiguration = {
        region: 'us-west-1',
        accessKeyId: '',
        secretAccessKey: '',
    };

    const sourceTableName = '';
    const sourceDdbClient = new DynamoDB.DocumentClient(config);
    const sourceDdb = new DynamoDB(config);

    sourceDdb.describeTable(
        {
            TableName: sourceTableName,
        },
        (err, data) => {
            if (err) {
                console.error(err);
            } else {
                console.log(data);
            }
        }
    );

    const destinationTableName = '';
    const destinationDdbClient = new DynamoDB.DocumentClient(config);
    const destinationDdb = new DynamoDB(config);

    destinationDdb.describeTable(
        {
            TableName: destinationTableName,
        },
        (err, data) => {
            if (err) {
                console.error(err);
            } else {
                console.log(data);
            }
        }
    );

    const props: CopyProps = {
        sourceTableName,
        sourceDdbClient,
        sourceDdb,
        destinationTableName,
        destinationDdbClient,
        destinationDdb,
    };

    copyStartingFrom(props);
}

function copyStartingFrom(props: CopyProps, ExclusiveStartKey?: Key) {
    const { sourceTableName, sourceDdbClient, destinationTableName, destinationDdbClient } = props;

    console.log(`Starting scan... from :${ExclusiveStartKey}`);

    sourceDdbClient.scan(
        {
            TableName: sourceTableName,
            Limit: 25,
            ExclusiveStartKey,
        },
        (err, data) => {
            console.log('Completed scan!');

            console.log({ err });
            console.log({ data });

            const { LastEvaluatedKey } = data;

            const items = data.Items?.map((Item): WriteRequest => {
                return {
                    PutRequest: {
                        Item,
                    },
                };
            });

            if (items == null || LastEvaluatedKey == null) {
                console.log('No more items to copy!');
                return;
            }

            console.log('Copying items...');

            destinationDdbClient.batchWrite(
                {
                    RequestItems: {
                        [destinationTableName]: items,
                    },
                },
                (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    console.log({ data });
                    console.log('Copied items!');
                    console.log('Waiting until next copy...');

                    setTimeout(() => {
                        copyStartingFrom(props, LastEvaluatedKey);
                    }, 200);
                }
            );
        }
    );
}

main();
