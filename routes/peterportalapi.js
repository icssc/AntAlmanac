const express = require('express')
const router = express.Router();
const https = require('https');

router.get('/courses/:deptCode/:courseNumber', async (req, res) => {
  const courseID = `${req.params.deptCode.replace(/\s/g, '')}${req.params.courseNumber.replace(/\s/g, '')}`

  const options = {
    hostname: 'api.peterportal.org',
    path: `/rest/v0/courses/${courseID}`,
    headers: {
      'x-api-key': process.env.PETERPORTAL_API_KEY
    }
  }

  https.get(options, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {data += chunk;});

    resp.on('end', () => {
      res.status(200).send(data)
    });
  }).on("error", (err) => {
    res.status(500).json({error: err.message})
  });
});

module.exports = router;