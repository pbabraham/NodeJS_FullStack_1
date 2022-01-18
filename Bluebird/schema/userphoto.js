let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserPhotoSchema = mongoose.Schema({
    user_id : { type: mongoose.Schema.Types.ObjectId },
    userphotos : [{
        photourl : { type : String }
    }],
    photodate : { type: Date, default: Date.now() },
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


module.exports = mongoose.model('userphoto', UserPhotoSchema, 'userphoto');
