const express = require('express');
const router = express.Router();
const { getById, insertById } = require('../db/ddb.ts');
const User = require('$models/User.js');
const connectToDb = require('../db.js');

router.post('/loadUserData', async (req, res) => {
    try {
        const userID = req.body.userID;
        const data = await getById(userID);

        if (data === null) res.status(404).send({ error: `User data for ${userID} not found` });
        else res.status(200).send({ userID: data.id, userData: data.userData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/loadLegacyUserData', async (req, res) => {
    await connectToDb();

    try {
        const userID = req.body.userID;
        const data = await User.findById(userID);

        if (data === null) res.status(404).send({ error: `User data for ${userID} not found` });
        else res.status(200).send({ userID: data._id, userData: data.userData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/saveUserData', async (req, res) => {
    try {
        const userID = req.body.userID;
        const userData = req.body.userData;

        await insertById(userID, userData);
        res.status(200).send();
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
