let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserAnalyticSchema = mongoose.Schema({
    user_id : { type: mongoose.Schema.Types.ObjectId },
    weightarr: [{
        userweight : { type : Number },
        date : {type: Date, default: Date.now},
        userweightType : { type : Number }
    }],
    bodyfatarr: [{
        userbodyfat : { type : Number },
        date : { type: Date, default: Date.now},
    }],
    lbmarr: [{
        userlbm : { type : Number },
        date : {type: Date, default: Date.now},
    }],
    bmrarr: [{
        userbmr : { type : Number },
        date : {type: Date, default: Date.now},
    }],
    userweight : { type : Number },
    userweightType : { type : Number },
    userbodyfat : { type : Number },
    userlbm : { type : Number },
    userbmr : { type : Number },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('useranalytics', UserAnalyticSchema, 'useranalytics');
