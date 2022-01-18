let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let AppversionSchema = mongoose.Schema({
    ios : { type : String },
    android : { type : String },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('appversion', AppversionSchema, 'appversion');
