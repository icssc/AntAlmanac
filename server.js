const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const websocApi = require('websoc-api');
const AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws_config.json');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongoDbUri);
let db = null;
client.connect((err) => {
    console.log("Connected to MongoDB Atlas");
    db = client.db('aants_db');
});

const catalogue = require('./ad_banners/bannerCatalogue.js');
const app = express();
const axios = require('axios');

app.use(express.static(path.join(__dirname, '/client/build')));
app.use(bodyParser.json());

app.post('/api/websocapi/', (req, res) => {
    //TODO: Error handling
    const jsonData = websocApi.callWebSocAPI(req.body);
    jsonData.then((json) => res.send(json));
});

app.post('/api/saveUserData', (req, res) => {
    db.collection('user_schedules').updateOne(
        {_id: {$eq: req.body.userID}},
        {$set: {_id : req.body.userID, userData: req.body.userData}},
        { upsert: true },
        (err) => {
            if (err)
                res.status(500).send();
            else
                res.status(200).send();
        });
});

app.post('/api/registerAlerts', (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const sectionCode = req.body.sectionCode;

    db.collection('notifications_data').updateOne(
        {'sectionCode' : sectionCode, 'name': name},
        {$addToSet : {'phoneNumbers': phoneNumber, 'emails': email}},
        { upsert: true },
        (err) => {
            if (err)
                res.status(500).send();
            else
                res.status(200).send();
        });

    db.collection('notifications_data').updateOne(
        {'sectionCode' : code, 'name': name},
        {pull : {'phoneNumbers': "", 'emails': ""}},
        { upsert: true },
        (err) => {
            if (err)
                res.status(500).send();
            else
                res.status(200).send();
        });
});

app.post('/api/loadUserData', (req, res) => {
    db.collection('user_schedules').findOne(
        {_id: {$eq: req.body.userID}},
        (err, result) => {
            if (err || result === null) {
                res.status(500).send();
            } else {
                res.status(200).send({ userID: result._id, userData: result.userData });
            }
        });
});

app.get('/api/getAdImage/:bannerName', (req, res) => {
    fs.access(path.join(__dirname, 'ad_banners', req.params.bannerName), fs.F_OK, (err) => {
        if (err) {
            console.error(err);
            res.status(404).send();
        } else {
            res.status(200).sendFile(path.join(__dirname, 'ad_banners', req.params.bannerName));
        }
    });
});

app.get('/api/getRandomAd', (req, res) => {
    const deptCode = req.query['deptCode'];
    const adProbabilityArray = [];

    for (let i = 0; i < catalogue.length; i++) {
        if (catalogue[i].dept.includes(deptCode)) {
            for (let j = 0; j < 5; j++)
                adProbabilityArray.push(i);
        } else {
            adProbabilityArray.push(i);
        }
    }

    const index = Math.floor(Math.random() * adProbabilityArray.length);

    res.status(200).send({
       bannerName: catalogue[adProbabilityArray[index]].bannerName,
       bannerLink: catalogue[adProbabilityArray[index]].url
    });
});

app.post('/api/lookupNotifications', (req, res) => {
    let apiUrl = 'https://dqb4drylx2.execute-api.us-west-2.amazonaws.com/default/AANTS-DB-manager';

    const emailCheck = axios.get(apiUrl, {
        params: {
            notif_type: 'email',
            key: req.body.email,
            command: 'lookup',
        },
    });

    const smsCheck = axios.get(apiUrl, {
        params: {
            notif_type: 'sms',
            key: req.body.phoneNumber,
            command: 'lookup',
        },
    });

    axios.all([emailCheck, smsCheck]).then(axios.spread((emailResponse, smsResponse) => {
                const response = {
            emailNotificationList: emailResponse.data.result,
            smsNotificationList: smsResponse.data.result,
        };

        res.status(200).send(response);
    })).catch(errors => {
        console.error(errors);

        res.status(500).send();
    });
});

app.post('/api/graphData', (req, res) => {
    const quarter = req.body.pastTerm.split(" ")[1].toLowerCase();
    const year = parseInt(req.body.pastTerm.split(" ")[0]);
    const sectionCode = req.body.sectionCode;

    db.collection('enrollment_data').findOne(
        {quarter, year, sectionCode },
        (err, result) => {
            if (err || result === null) {
                console.log(err);
                res.status(500).send();
            } else {
                res.status(200).send({data: result.data});
            }
        });
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(8080, () => console.log('Started Express server'));