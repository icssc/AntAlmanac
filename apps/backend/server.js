const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');
require('dotenv').config();

const setup = (stage) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    if (stage === 'prod') {
        app.use(
            cors({
                origin: [
                    'https://antalmanac.com',
                    'https://www.antalmanac.com',
                    'https://icssc-projects.github.io/AntAlmanac',
                ],
            })
        );
    } else {
        app.use(
            cors({
                origin: [/(a-Z,0-9,-)*\.antalmanac\.com$/, /^http:\/\/localhost:\d*/],
                credentials: true,
            })
        );
    }

    app.use('/api', routes);
    return app;
};

module.exports = setup;
