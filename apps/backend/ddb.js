const { DynamoDB } = require('aws-sdk/');
require('dotenv').config();

const documentClient = new DynamoDB.DocumentClient({ region: process.env.AWS_REGION });
const TABLENAME = process.env.USERDATA_TABLE_NAME;

function callback(err, data) {
    if (err) {
        console.error('Error', err);
    } else {
        console.log('Success');
    }
}

async function getById(id) {
    var params = {
        TableName: TABLENAME,
        Key: {
            id: id,
        },
    };

    const data = await documentClient.get(params, callback).promise();
    return data.Item;
}

async function insertById(id, userData) {
    var params = {
        TableName: TABLENAME,
        Item: {
            id: id,
            userData: userData,
        },
    };

    await documentClient.put(params, callback).promise();
}

module.exports = { getById, insertById };
