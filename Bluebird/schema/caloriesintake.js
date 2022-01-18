let mongoose = require('mongoose');
let Schema = mongoose.Schema;
//caloriesArr will maintain individual data for breakfast, lunch so on etc 
let CaloriesIntakeSchema = new mongoose.Schema({
    user_id:{ type: mongoose.Schema.Types.ObjectId },
    mealId : { type: mongoose.Schema.Types.ObjectId },
    mealplandate : { type: Date },
    caloriesEaten : { type : Number },
    carbsEaten : { type : Number },
    proteinEaten : { type : Number },
    fatsEaten : { type : Number },
    // burn : { type : Number },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = new mongoose.model('caloriesintake', CaloriesIntakeSchema, 'caloriesintake');



// calories : {
//     cal_id : { type: mongoose.Schema.Types.ObjectId },
//     cal : { type : Number },
//     carbs : { type : Number },
//     prot : { type : Number },
//     fat : { type : Number },
// },
// carbs : {
//     carb_id : { type: mongoose.Schema.Types.ObjectId },
//     cal : { type : Number },
//     carbs : { type : Number },
//     prot : { type : Number },
//     fat : { type : Number },
// },
// proteins : {
//     prot_id : { type: mongoose.Schema.Types.ObjectId },
//     cal : { type : Number },
//     carbs : { type : Number },
//     prot : { type : Number },
//     fat : { type : Number },
// },
// fats : {
//     fat_id : { type: mongoose.Schema.Types.ObjectId },
//     cal : { type : Number },
//     carbs : { type : Number },
//     prot : { type : Number },
//     fat : { type : Number },
// }, 

    
    // carbs : { type : Number },
    // protein : { type : Number },
    // fat : { type : Number },
// { old req,body
//     "mealplandate" : "2021-07-28T00:00:00.000Z",
//     "calories" : 1,
//     "carbs" :1,
//     "protein" : 1,
//     "fat" : 1
// }

// meal6_caloriesArr : [{
//     calories : {
//         cal_id : { type: mongoose.Schema.Types.ObjectId },
//         cal : { type : Number },
//         carbs : { type : Number },
//         protein : { type : Number },
//         fat : { type : Number },
//     },
//     carbs : {
//         carbs_id : { type: mongoose.Schema.Types.ObjectId },
//         cal : { type : Number },
//         carbs : { type : Number },
//         protein : { type : Number },
//         fat : { type : Number },
//     },
//     protiens : {
//         proteins_id : { type: mongoose.Schema.Types.ObjectId },
//         cal : { type : Number },
//         carbs : { type : Number },
//         protein : { type : Number },
//         fat : { type : Number },
//     },
//     fats : {
//         fats_id : { type: mongoose.Schema.Types.ObjectId },
//         cal : { type : Number },
//         carbs : { type : Number },
//         protein : { type : Number },
//         fat : { type : Number },
//     }, 
    
// }],