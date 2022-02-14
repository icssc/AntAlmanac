const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
    sectionCode: String,
    courseTitle: String,
    phoneNumbers: [String],
});

module.exports = mongoose.model('Notification', NotificationSchema);
