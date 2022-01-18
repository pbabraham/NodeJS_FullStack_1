let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let AppleWatchCaloriesSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId }, 
    date : { type : Date , required : true},
    calories : { type : Number , required : true},  
})

module.exports = mongoose.model('applewatchdata', AppleWatchCaloriesSchema, 'applewatchdata');