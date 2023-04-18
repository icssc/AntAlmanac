const mongoose = require('mongoose');

const EnrollmentData = mongoose.Schema({
    quarter: String,
    sectionCode: String,
    year: String,
    data: [
        {
            date: String,
            maxCapacity: String,
            numCurrentlyEnrolled: String,
            numOnWaitlist: String,
            numRequested: String,
            restrictions: String,
        },
    ],
});

module.exports = mongoose.model('EnrollmentData', EnrollmentData, 'enrollment_data');
