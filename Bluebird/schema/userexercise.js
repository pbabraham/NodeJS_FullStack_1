let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserExerciseSchema = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId }, 
    exerciseId:  { type : Object},
    date : { type : Date },
    calories : { type : Number },
})

module.exports = mongoose.model('userexercise', UserExerciseSchema, 'userexercise');