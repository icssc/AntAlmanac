const express = require('express')
const router = express.Router()

const adsRoute = require('./ads')
const enrollmentData = require('./enrollmentData')
const notificationsRoute = require('./notifications')
const userDataRoute = require('./users')
const websocapiRoute = require('./websocapi')

router.use('/ads', adsRoute)
router.use('/enrollmentData', enrollmentData)
router.use('/notifications', notificationsRoute)
router.use('/userData', userDataRoute)
router.use('/websocapi', websocapiRoute)

module.exports = router