const express = require('express');
const router = express.Router();
const News = require('../models/News');
const connectToDb = require('../db');

router.get('/', async (req, res) => {
    await connectToDb();

    try {
        const data = await News.find({});

        res.status(200).send({ news: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
