const mongoose = require('mongoose');

const User = mongoose.Schema({
    _id: String,
    userData: {
        addedCourses: [
            {
                color: String,
                term: String,
                sectionCode: String,
                scheduleIndices: [Number],
            },
        ],
        customEvents: [
            {
                customEventID: String,
                color: String,
                title: String,
                days: [Boolean],
                scheduleIndices: [Number],
                start: String,
                end: String,
            },
        ],
    },
});

module.exports = mongoose.model('User', User);
