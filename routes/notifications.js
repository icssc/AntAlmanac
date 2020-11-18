const express = require('express')
const router = express.Router();
const Notification = require('../models/Notification')

router.post('/registerNotifications', async (req, res) => {
  const {phoneNumber, sectionCode, courseTitle} = req.body;

  try {
    await Notification.findOneAndUpdate(
      {'sectionCode' : sectionCode, 'courseTitle': courseTitle},
      {$addToSet : {'phoneNumbers': phoneNumber}},
      { upsert: true })

    res.status(200).send()
  } catch (err) {
    res.status(500).json({error: err.message})
  }
});

router.post('/lookupNotifications', async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber
    const data = await Notification.find({ phoneNumbers: phoneNumber })

    res.status(200).send({ smsNotificationList: data })
  } catch (err) {
    res.status(500).json({error: err.message})
  }
});

module.exports = router;
