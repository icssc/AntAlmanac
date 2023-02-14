const express = require('express');
const router = express.Router();

const adsRoute = require('./ads');
const enrollmentData = require('./enrollmentData');
const notificationsRoute = require('./notifications');
const usersRoute = require('./users');
const websocapiRoute = require('./websocapi');
const newsRoute = require('./news');

router.use('/banners', adsRoute);
router.use('/enrollmentData', enrollmentData);
router.use('/notifications', notificationsRoute);
router.use('/users', usersRoute);
router.use('/websocapi', websocapiRoute);
router.use('/news', newsRoute);

module.exports = router;
