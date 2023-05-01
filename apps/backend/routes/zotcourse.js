const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const zotcourseUrl = 'https://zotcourse.appspot.com/schedule/load';

router.post('/loadUserData', async (req, res) => {
    try {
        let url = new URL(zotcourseUrl);
        url.searchParams.append('username', req.body.scheduleName);
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
