const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router();
const catalogue = require('./ad_banners/bannerCatalogue.js');

router.get('/getAdImage/:bannerName', (req, res) => {
  fs.access(path.join(__dirname, 'ad_banners', req.params.bannerName), fs.F_OK, (err) => {
    if (err) {
      res.status(404).send(err);
    } else {
      res.status(200).sendFile(path.join(__dirname, 'ad_banners', req.params.bannerName));
    }
  });
});

router.get('/getRandomAd', (req, res) => {
  const deptCode = req.query['deptCode'];
  const adProbabilityArray = [];

  for (let i = 0; i < catalogue.length; i++) {
    if (catalogue[i].dept.includes(deptCode)) {
      for (let j = 0; j < 5; j++)
        adProbabilityArray.push(i);
    } else {
      adProbabilityArray.push(i);
    }
  }

  const index = Math.floor(Math.random() * adProbabilityArray.length);

  res.status(200).send({
    bannerName: catalogue[adProbabilityArray[index]].bannerName,
    bannerLink: catalogue[adProbabilityArray[index]].url
  });
});

module.exports = router;