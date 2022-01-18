let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ExerciseImgSchema = mongoose.Schema({
    exerciseId:  { type : Number },
    description : { type : String },
    metValue : { type : Number },
    exerciseIcon : { type : String },
    // exerciseIconUrl : { type : String }
  
})

module.exports = mongoose.model('exercise', ExerciseImgSchema, 'exercise');