const express = require('express');
const EnrollmentData = require('../models/EnrollmentData');
const router = express.Router();
const connectToDb = require('../db');

router.post('/', async (req, res) => {
    await connectToDb();

    try {
        const quarter = req.body.pastTerm.split(' ')[1].toLowerCase();
        const year = req.body.pastTerm.split(' ')[0];
        const sectionCode = req.body.sectionCode;

        const result = await EnrollmentData.findOne({ quarter: quarter, year: year, sectionCode: sectionCode });

        if (result === null)
            res.status(500).send({ error: `Enrollment data for ${sectionCode} in ${quarter} ${year} not found` });
        else res.status(200).send({ data: result.data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
