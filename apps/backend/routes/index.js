const express = require('express');
const router = express.Router();

const adsRoute = require('./ads');
const enrollmentData = require('./enrollmentData');
const notificationsRoute = require('./notifications');
const usersRoute = require('./users');
const newsRoute = require('./news');
const zotcourseRoute = require('./zotcourse');

router.use('/banners', adsRoute);
router.use('/enrollmentData', enrollmentData);
router.use('/notifications', notificationsRoute);
router.use('/users', usersRoute);
router.use('/news', newsRoute);
router.use('/zotcourse', zotcourseRoute);

module.exports = router;
