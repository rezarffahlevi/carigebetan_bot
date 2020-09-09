const mongoose = require('mongoose');
const CONSTANT = require('../utils/constant');


mongoose.connect(CONSTANT.DB_URL, { useNewUrlParser: true, useFindAndModify:false });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('Mongoose default connection open to ' + CONSTANT.DB_URL);
});
db.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', function () {
    db.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});
