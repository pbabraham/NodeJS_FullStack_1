let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let swapmealSchema = mongoose.Schema({
    user_id:{ type: mongoose.Schema.Types.ObjectId },
    mealplandate : { type: Date },
    usermeal_id:{ type: mongoose.Schema.Types.ObjectId },
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
    usertype : { type : String },
    total_tdee : { type : Number },
    mealplan1 : { type : Number },
    mealplan2 : { type : Number },
    mealplantype : { type : Number },
    mealwaterdata : { type : Number },
    total_cups_count : { type : Number },
    usergoal : { type : Number },
    meal10 : { type: mongoose.Schema.Types.ObjectId },
    meal11 : { type: mongoose.Schema.Types.ObjectId },
    meal12 : { type: mongoose.Schema.Types.ObjectId },
    meal13 : { type: mongoose.Schema.Types.ObjectId },
    meal20 : { type: mongoose.Schema.Types.ObjectId },
    meal21 : { type: mongoose.Schema.Types.ObjectId },
    meal22 : { type: mongoose.Schema.Types.ObjectId },
    meal23 : { type: mongoose.Schema.Types.ObjectId },
    meal30 : { type: mongoose.Schema.Types.ObjectId },
    meal31 : { type: mongoose.Schema.Types.ObjectId },
    meal32 : { type: mongoose.Schema.Types.ObjectId },
    meal33 : { type: mongoose.Schema.Types.ObjectId },
    meal40 : { type: mongoose.Schema.Types.ObjectId },
    meal41 : { type: mongoose.Schema.Types.ObjectId },
    meal42 : { type: mongoose.Schema.Types.ObjectId },
    meal43 : { type: mongoose.Schema.Types.ObjectId },
    meal50 : { type: mongoose.Schema.Types.ObjectId },
    meal51 : { type: mongoose.Schema.Types.ObjectId },
    meal52 : { type: mongoose.Schema.Types.ObjectId },
    meal53 : { type: mongoose.Schema.Types.ObjectId },
    meal60 : { type: mongoose.Schema.Types.ObjectId },
    meal61 : { type: mongoose.Schema.Types.ObjectId },
    meal62 : { type: mongoose.Schema.Types.ObjectId },
    meal63 : { type: mongoose.Schema.Types.ObjectId },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('swapmeal', swapmealSchema, 'swapmeal');
