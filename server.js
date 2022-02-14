const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(
    cors({
        origin: ['https://antalmanac.com', 'https://www.antalmanac.com', 'https://icssc-projects.github.io/AntAlmanac'],
    })
);
app.use('/api', routes);

module.exports.handler = serverless(app, { binary: ['image/*'] });
