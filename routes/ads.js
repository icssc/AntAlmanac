const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const catalogue = require('./ad_banners/bannerCatalogue.js');

router.get('/getAdImage/:bannerName', (req, res) => {
    fs.access(path.join(__dirname, 'ad_banners', req.params.bannerName), fs.constants.R_OK, (err) => {
        if (err) {
            res.status(404).send(err);
        } else {
            const file_path = path.join(__dirname, 'ad_banners', req.params.bannerName);
            res.type(path.extname(file_path));
            res.setHeader('isBase64Encoded', 'true');
            const file = fs.readFileSync(file_path);
            res.status(200).send(file);
        }
    });
});

router.get('/getRandomAd', (req, res) => {
    const deptCode = req.query['deptCode'];
    const adProbabilityArray = [];

    for (let i = 0; i < catalogue.length; i++) {
        const currentDate = new Date().toISOString().slice(0, 10);

        if (catalogue[i].endDate === undefined || currentDate <= catalogue[i].endDate) {
            if (catalogue[i].dept.includes('any') || catalogue[i].dept.includes(deptCode)) adProbabilityArray.push(i);
        }
    }

    const index = Math.floor(Math.random() * adProbabilityArray.length);

    res.status(200).send({
        bannerName: catalogue[adProbabilityArray[index]].bannerName,
        bannerLink: catalogue[adProbabilityArray[index]].url,
    });
});

module.exports = router;
