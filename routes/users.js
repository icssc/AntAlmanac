const express = require('express');
const router = express.Router();
const User = require('../models/User');
const connectToDb = require('../db');

router.post('/loadUserData', async (req, res) => {
    await connectToDb();

    try {
        const userID = req.body.userID;
        const data = await User.findById(userID);

        if (data === null) res.status(500).send({ error: `User data for ${userID} not found` });
        else res.status(200).send({ userID: data._id, userData: data.userData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/saveUserData', async (req, res) => {
    await connectToDb();

    try {
        const userID = req.body.userID;
        const userData = req.body.userData;

        await User.findByIdAndUpdate(userID, { $set: { _id: userID, userData: userData } }, { upsert: true });
        res.status(200).send();
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
