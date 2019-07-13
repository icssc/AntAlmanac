const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const websocApi = require('websoc-api');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

app.post('/api/websocapi/', function (req, res) {
 //TODO: Error handling
 const jsonData = websocApi.callWebSocAPI(req.body);
 jsonData.then((json) => res.send(json));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(8080, () => console.log("started"));