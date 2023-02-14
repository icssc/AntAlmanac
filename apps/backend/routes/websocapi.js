const express = require('express');
const router = express.Router();
const websocApi = require('websoc-api');

router.post('/', async (req, res) => {
    try {
        const jsonData = await websocApi.callWebSocAPI(req.body);

        res.status(200).send(jsonData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
