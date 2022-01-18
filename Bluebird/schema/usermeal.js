let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UsermealSchema = mongoose.Schema({
    mealplan : { type : Array },
    user_id:{ type: mongoose.Schema.Types.ObjectId },
    mealplandate : { type: Date },
    bodytype : { type : String },
    carbs : { type : Number },
    protein : { type : Number },
    fat : { type : Number },
    workouttype : { type : String },
    workpercentage : { type : Number },
    leveltype : { type : String },
    levelpercentage : { type : Number },
    weight : { type : Number },
    bodyfat : { type : Number },
    bmr : { type : Number },
    diettype : { type : Number },
    mealpercentage : { type : Array },
    usertype : { type : String },
    total_tdee : { type : Number },
    mealplan1 : { type : Number },
    mealplan2 : { type : Number },
    mealplantype : { type : Number },
    mealwaterdata : { type : Number },
    total_cups_count : { type : Number },
    usergoal : { type : Number },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('usermeal', UsermealSchema, 'usermeal');
