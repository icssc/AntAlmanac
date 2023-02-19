const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');
require('dotenv').config();

const setup = (corsEnabled) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    if (corsEnabled) {
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
        app.use(cors());
    }

    app.use('/api', routes);
    return app;
};

module.exports = setup;
