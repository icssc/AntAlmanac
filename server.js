const express = require('express')
const serverless = require('serverless-http');
require('dotenv').config({path:__dirname + '/.env'})
const bodyParser = require('body-parser');
const routes = require('./routes')
const cors = require('cors')
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: ['https://antalmanac.com', 'https://www.antalmanac.com']}))
app.use('/api', routes)

app.listen(8080, () => console.log('Server is running'))

module.exports.handler = serverless(app, {binary: ['image/*']});