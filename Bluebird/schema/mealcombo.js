let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let MealComboSchema = mongoose.Schema({
    mainmeal_id : {
        type : mongoose.Schema.Types.ObjectId
    },
    submeal_id : {
        type : mongoose.Schema.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
}, { strict: false });


module.exports = mongoose.model('mealcombo', MealComboSchema, 'mealcombo');
