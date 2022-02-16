const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');
const app = express();
require('dotenv').config();

const port = 8080;

app.use(bodyParser.json());
app.use(
    cors({
        origin: ['https://antalmanac.com', 'https://www.antalmanac.com', 'https://icssc-projects.github.io/AntAlmanac'],
    })
);
app.use('/api', routes);

app.listen(port, () => console.log(`Running local server on port ${port}`));
