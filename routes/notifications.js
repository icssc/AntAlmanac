const express = require('express')
const router = express.Router();
const Notification = require('../models/Notification')
const connectToDb = require('../db')

router.post('/registerNotifications', async (req, res) => {
  await connectToDb();

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
  await connectToDb();

  try {
    const phoneNumber = req.body.phoneNumber
    const data = await Notification.find({ phoneNumbers: phoneNumber })

    const smsNotificationsList = data.map((section) => {
      return {sectionCode: section.sectionCode, courseTitle: section.courseTitle}
    })

    res.status(200).send({ smsNotificationList: smsNotificationsList })
  } catch (err) {
    res.status(500).json({error: err.message})
  }
});

module.exports = router;
