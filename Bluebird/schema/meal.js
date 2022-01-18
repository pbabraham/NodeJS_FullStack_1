let mongoose = require('mongoose')
// let mongoosePaginate = require('mongoose-paginate-v2')
// let aggregatePaginate = require('mongoose-aggregate-paginate-v2')
let Schema = mongoose.Schema
const Joi = require('@hapi/joi')

let MealSchema = mongoose.Schema(
  {
    mediterranean: { type: String, required: true },
    paleo: { type: String, required: true },
    pescatarian: { type: String, required: true },
    vegan: { type: String, required: true },
    cooking_time_minutes: { type: String, required: true },
    directions: { type: String },
    food_benefits: { type: String, required: true },
    name: { type: String, required: true },
    grocery_list_name: { type: String, required: true },
    category: { type: String, required: true },
    size: { type: String, required: true },
    image_name: { type: String, required: true },
    cal: { type: Number, required: true },
    fats: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fiber: { type: Number, required: true },
    prot: { type: Number, required: true },
    sodium: { type: Number, required: true },
    sugar: { type: Number, required: true },
    meal1: { type: String, required: true },
    meal2: { type: String, required: true },
    meal3: { type: String, required: true },
    meal4: { type: String, required: true },
    meal5: { type: String, required: true },
    meal6: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updateAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
)

// MealSchema.plugin(mongoosePaginate)
// MealSchema.plugin(aggregatePaginate)

module.exports = mongoose.model('meal', MealSchema, 'meal')
