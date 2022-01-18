let mongoose = require('mongoose')
let Schema = mongoose.Schema

let favouriteSchema = mongoose.Schema(
  {
    meal_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    user_id: { type: mongoose.Schema.Types.ObjectId },
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

module.exports = mongoose.model('favourites', favouriteSchema, 'favourites ')
