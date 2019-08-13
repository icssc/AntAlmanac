const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const websocApi = require('websoc-api');
const AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

app.post('/api/websocapi/', (req, res) => {
 //TODO: Error handling
 const jsonData = websocApi.callWebSocAPI(req.body);
 jsonData.then((json) => res.send(json));
});

app.post('/api/saveUserData', (req, res) => {
    //TODO: Error Handling
    const params = {
        TableName: "scheduleDataTest",
        Item: {
            userID: req.body.userID,
            userData: req.body.userData // save user schedules
        }
    };
    dynamoDb.put(params, (err, data) => {
        if (err)
            res.status(500).send();
        else
            res.status(200).send();
    });
});

app.get('/api/loadUserData', (req, res) => {
    //TODO: Error Handling
    const params = {
        TableName: "scheduleDataTest",
        Key: {
            userID: req.query.userID
        }
    };
    dynamoDb.get(params, (err, data) => {
        if (err) console.log(err);
        else res.status(200).send(data.Item);
    });
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(8080, () => console.log("started"));