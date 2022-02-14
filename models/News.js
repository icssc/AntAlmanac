const mongoose = require('mongoose');

const NewsSchema = mongoose.Schema({
    title: String,
    body: String,
    date: String,
});

module.exports = mongoose.model('News', NewsSchema);
