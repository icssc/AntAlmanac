const express = require('express')
const serverless = require('serverless-http');
require('dotenv').config({path:__dirname + '/.env'})
const bodyParser = require('body-parser');
const routes = require('./routes')

const app = express();
app.use(bodyParser.json());
app.use('/api', routes)

app.listen(8080, () => console.log('Server is running'))

module.exports.handler = serverless(app);