const mongoose = require('mongoose');
const connection = {};

module.exports = async function () {
    if (connection.isConnected) {
        console.log('=> using existing database connection');
    } else {
        console.log('=> using new database connection');
        const db = await mongoose.connect(process.env.AA_MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        connection.isConnected = db.connections[0].readyState;
        db.connection.once('open', function () {
            console.log('Connected to MongoDB');
        });
        db.connection.on('error', console.error.bind(console, 'Connection error:'));
    }
};
