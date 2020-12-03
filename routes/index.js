const express = require('express')
const router = express.Router()

const adsRoute = require('./ads')
const enrollmentData = require('./enrollmentData')
const notificationsRoute = require('./notifications')
const usersRoute = require('./users')
const websocapiRoute = require('./websocapi')
const peterportalapiRoute = require('./peterportalapi')

router.use('/ads', adsRoute)
router.use('/enrollmentData', enrollmentData)
router.use('/notifications', notificationsRoute)
router.use('/users', usersRoute)
router.use('/websocapi', websocapiRoute)
router.use('/peterportalapi', peterportalapiRoute)

module.exports = router