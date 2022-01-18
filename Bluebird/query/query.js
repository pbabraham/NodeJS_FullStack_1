const mongoose = require('mongoose')
let insert = (collection, query) => {
  return new Promise((resolve, reject) => {
    let saveData = new collection(query)
    saveData.save(query, (err, result) => {
      if (err) return reject(err)
      return resolve(result)
    })
  })
}

let find = (collection, query, additionalParameter) => {
  let options = { limit: 10 }
  return new Promise((resolve, reject) => {
    additionalParameter == undefined
      ? collection.find(query, (err, queryResult) => {
          if (err) {
            return reject(err)
          } else {
            resolve(queryResult ? queryResult : null)
          }
        })
      : collection.find(query, additionalParameter, (err, queryResult) => {
          if (err) {
            return reject(err)
          } else {
            resolve(queryResult ? queryResult : null)
          }
        })
  })
}

let findOne = (collection, query, additionalParameter) => {
  return new Promise((resolve, reject) => {
    additionalParameter == undefined
      ? collection.findOne(query, (err, queryResult) => {
          if (err) {
            return reject(err)
          } else {
            resolve(queryResult ? queryResult : null)
          }
        })
      : collection.findOne(query, additionalParameter, (err, queryResult) => {
          if (err) {
            return reject(err)
          } else {
            resolve(queryResult ? queryResult : null)
          }
        })
  })
}

let findOneAndUpdate = (collection, findBy, query) => {
  return new Promise((resolve, reject) => {
    collection.findOneAndUpdate(findBy, query, { new: true }, (err, result) => {
      err ? reject(err) : resolve(result)
    })
  })
}

let updateOne = (collection, findBy, query) => {
  return new Promise((resolve, reject) => {
    collection.updateOne(findBy, query, (err, result) => {
      err ? reject(err) : resolve(result)
    })
  })
}

let update = (collection, findBy, query) => {
  return new Promise((resolve, reject) => {
    collection.update(findBy, query, (err, result) => {
      err ? reject(err) : resolve(result)
    })
  })
}

let deleteMany = (collection, query) => {
  return new Promise((resolve, reject) => {
    collection.deleteMany(query, (err, deletedRecords) => {
      err ? reject(err) : resolve(deletedRecords)
    })
  })
}

let deleteOne = (collection, query) => {
  return new Promise((resolve, reject) => {
    collection.deleteOne(query, (err, deletedRecords) => {
      err ? reject(err) : resolve(deletedRecords)
    })
  })
}

let aggregate = (collection, query) => {
  return new Promise((resolve, reject) => {
    collection.aggregate(query, (err, queryResult) => {
      err ? reject(err) : resolve(queryResult)
    })
  })
}

let newAggregate = (collection, query, additionalParameter) => {
  return new Promise((resolve, reject) => {
    additionalParameter == undefined
      ? collection.aggregate(query, (err, queryResult) => {
          err ? reject(err) : resolve(queryResult)
        })
      : collection.aggregate(query, additionalParameter, (err, queryResult) => {
          err ? reject(err) : resolve(queryResult)
        })
  })
}

let count = (collection, query) => {
  return new Promise((resolve, reject) => {
    collection
      .count(query, (err, queryResult) => {
        err ? reject(err) : resolve(queryResult)
      })
      .count()
  })
}

let paginateByCategory = async (model, category, page, limit) => {
  limit = Number(limit) || 10
  page = Number(page) || 1
  console.log('paginate by category')
  const skip = Number(page - 1) * Number(limit)
  const endIndex = parseInt(page) * parseInt(limit)

  let data = await model.aggregate([
    { $match: { category: category } },
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $facet: {
        edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
        pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
  ])

  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

let paginate = async function (model, page, limit) {
  limit = Number(limit) || 10
  page = Number(page) || 1
  const skip = Number(page - 1) * Number(limit)
  const endIndex = parseInt()

  let data = await model.aggregate([
    {
      $group: {
        _id: '$name',
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $facet: {
        edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
        pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
  ])

  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

const paginateAndSearch = async function (
  model,
  search,
  page,
  limit,
  category
) {
  limit = Number(limit) || 10
  page = Number(page) || 1
  category = category || null
  const skip = Number(page - 1) * Number(limit)
  const endIndex = parseInt()
  let data
  // console.log('category in paginate and search', category)
  if (!category) {
    data = await model.aggregate([
      {
        $match: { name: { $regex: search, $options: 'i' } },
      },
      {
        $group: {
          _id: '$name',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
          pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
        },
      },
    ])
  } else {
    // console.log('limit * (page - 1) ', Number(limit))
    // console.log('page ', page)
    // console.log('typeof skip', typeof skip)
    data = await model.aggregate([
      {
        $match: { name: { $regex: search, $options: 'i' }, category: category },
      },
      { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
          pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
        },
      },
    ])
  }

  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

const paginatePopulate = async (model, userId, page, limit, category) => {
  // console.log('user_id', userId)
  let id = mongoose.Types.ObjectId(userId)
  // console.log('id', id)
  limit = Number(limit) || 10
  page = Number(page) || 1
  category = category || null
  const skip = Number(page - 1) * Number(limit)
  let data
  if (category) {
    data = await model.aggregate([
      { $match: { user_id: { $in: [id] } } },
      {
        $lookup: {
          from: 'meal',
          localField: 'meal_id',
          foreignField: '_id',
          as: 'meal',
        },
      },
      {
        $unwind: '$meal',
      },
      {
        $match: { 'meal.category': { $in: [category] } },
      },
      {
        $project: {
          _id: '$meal._id',
          // meal_id: 1,
          user_id: 1,
          createdAt: 1,
          updateAt: 1,
          name: '$meal.name',
          mediterranean: '$meal.mediterranean',
          paleo: '$meal.paleo',
          pescatarian: '$meal.pescatarian',
          vegan: '$meal.vegan',
          cooking_time_minutes: '$meal.cooking_time_minutes',
          directions: '$meal.directions',
          food_benefits: '$meal.food_benefits',
          grocery_list_name: '$meal.grocery_list_name',
          category: '$meal.category',
          size: '$meal.size',
          image_name: '$meal.image_name',
          cal: '$meal.cal',
          fats: '$meal.fats',
          carbs: '$meal.carbs',
          fiber: '$meal.fiber',
          prot: '$meal.prot',
          sodium: '$meal.sodium',
          sugar: '$meal.sugar',
          meal1: '$meal.meal1',
          meal2: '$meal.meal2',
          meal3: '$meal.meal3',
          meal4: '$meal.meal4',
          meal5: '$meal.meal5',
          meal6: '$meal.meal6',
          meal_created_at: '$meal.createdAt',
          meal_update_at: '$meal.updateAt',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
          pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
        },
      },
    ])
  } else {
    data = await model.aggregate([
      { $match: { user_id: { $in: [id] } } },
      {
        $lookup: {
          from: 'meal',
          localField: 'meal_id',
          foreignField: '_id',
          as: 'meal',
        },
      },
      {
        $unwind: '$meal',
      },
      {
        $project: {
          _id: '$meal._id',
          // meal_id: 1,
          user_id: 1,
          createdAt: 1,
          updateAt: 1,
          name: '$meal.name',
          mediterranean: '$meal.mediterranean',
          paleo: '$meal.paleo',
          pescatarian: '$meal.pescatarian',
          vegan: '$meal.vegan',
          cooking_time_minutes: '$meal.cooking_time_minutes',
          directions: '$meal.directions',
          food_benefits: '$meal.food_benefits',
          grocery_list_name: '$meal.grocery_list_name',
          category: '$meal.category',
          size: '$meal.size',
          image_name: '$meal.image_name',
          cal: '$meal.cal',
          fats: '$meal.fats',
          carbs: '$meal.carbs',
          fiber: '$meal.fiber',
          prot: '$meal.prot',
          sodium: '$meal.sodium',
          sugar: '$meal.sugar',
          meal1: '$meal.meal1',
          meal2: '$meal.meal2',
          meal3: '$meal.meal3',
          meal4: '$meal.meal4',
          meal5: '$meal.meal5',
          meal6: '$meal.meal6',
          meal_created_at: '$meal.createdAt',
          meal_update_at: '$meal.updateAt',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
          pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
        },
      },
    ])
  }

  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

const paginatePopulateSearch = async (
  model,
  userId,
  page,
  limit,
  category,
  search
) => {
  console.log('user_id', userId)
  console.log('search', search)
  limit = Number(limit) || 10
  page = Number(page) || 1
  category = category || null
  const skip = Number(page - 1) * Number(limit)
  let id = mongoose.Types.ObjectId(userId)
  // console.log('id', id)
  let data
  if (category) {
    data = await model.aggregate([
      { $match: { user_id: { $in: [id] } } },
      {
        $lookup: {
          from: 'meal',
          localField: 'meal_id',
          foreignField: '_id',
          as: 'meal',
        },
      },
      {
        $unwind: '$meal',
      },
      {
        $match: {
          'meal.category': { $in: [category] },
          'meal.name': { $regex: search, $options: 'i' },
        },
      },
      {
        $project: {
          _id: '$meal._id',
          // meal_id: 1,
          user_id: 1,
          createdAt: 1,
          updateAt: 1,
          name: '$meal.name',
          mediterranean: '$meal.mediterranean',
          paleo: '$meal.paleo',
          pescatarian: '$meal.pescatarian',
          vegan: '$meal.vegan',
          cooking_time_minutes: '$meal.cooking_time_minutes',
          directions: '$meal.directions',
          food_benefits: '$meal.food_benefits',
          grocery_list_name: '$meal.grocery_list_name',
          category: '$meal.category',
          size: '$meal.size',
          image_name: '$meal.image_name',
          cal: '$meal.cal',
          fats: '$meal.fats',
          carbs: '$meal.carbs',
          fiber: '$meal.fiber',
          prot: '$meal.prot',
          sodium: '$meal.sodium',
          sugar: '$meal.sugar',
          meal1: '$meal.meal1',
          meal2: '$meal.meal2',
          meal3: '$meal.meal3',
          meal4: '$meal.meal4',
          meal5: '$meal.meal5',
          meal6: '$meal.meal6',
          meal_created_at: '$meal.createdAt',
          meal_update_at: '$meal.updateAt',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
          pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
        },
      },
    ])
  } else {
    data = await model.aggregate([
      {
        $match: {
          user_id: { $in: [id] },
        },
      },
      {
        $lookup: {
          from: 'meal',
          localField: 'meal_id',
          foreignField: '_id',
          as: 'meal',
        },
      },
      {
        $unwind: '$meal',
      },
      {
        $match: {
          'meal.name': {
            $regex: search,
            $options: 'i',
          },
        },
      },
      {
        $project: {
          _id: '$meal._id',
          // meal_id: 1,
          user_id: 1,
          createdAt: 1,
          updateAt: 1,
          name: '$meal.name',
          mediterranean: '$meal.mediterranean',
          paleo: '$meal.paleo',
          pescatarian: '$meal.pescatarian',
          vegan: '$meal.vegan',
          cooking_time_minutes: '$meal.cooking_time_minutes',
          directions: '$meal.directions',
          food_benefits: '$meal.food_benefits',
          grocery_list_name: '$meal.grocery_list_name',
          category: '$meal.category',
          size: '$meal.size',
          image_name: '$meal.image_name',
          cal: '$meal.cal',
          fats: '$meal.fats',
          carbs: '$meal.carbs',
          fiber: '$meal.fiber',
          prot: '$meal.prot',
          sodium: '$meal.sodium',
          sugar: '$meal.sugar',
          meal1: '$meal.meal1',
          meal2: '$meal.meal2',
          meal3: '$meal.meal3',
          meal4: '$meal.meal4',
          meal5: '$meal.meal5',
          meal6: '$meal.meal6',
          meal_created_at: '$meal.createdAt',
          meal_update_at: '$meal.updateAt',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
          pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
        },
      },
    ])
  }

  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

const searchFavouriteMeal = async (model, userId, page, limit, search) => {
  limit = Number(limit) || 10
  page = Number(page) || 1
  const skip = Number(page - 1) * Number(limit)
  let id = mongoose.Types.ObjectId(userId)
  let data = await model.aggregate([
    { $match: { user_id: { $in: [id] } } },
    {
      $lookup: {
        from: 'meal',
        localField: 'meal_id',
        foreignField: '_id',
        as: 'meal',
      },
    },
    {
      $unwind: '$meal',
    },
    {
      $match: {
        'meal.name': {
          $regex: search,
          $options: 'i',
        },
      },
    },
    {
      $project: {
        _id: '$meal._id',
        // meal_id: 1,
        user_id: 1,
        createdAt: 1,
        updateAt: 1,
        name: '$meal.name',
        mediterranean: '$meal.mediterranean',
        paleo: '$meal.paleo',
        pescatarian: '$meal.pescatarian',
        vegan: '$meal.vegan',
        cooking_time_minutes: '$meal.cooking_time_minutes',
        directions: '$meal.directions',
        food_benefits: '$meal.food_benefits',
        grocery_list_name: '$meal.grocery_list_name',
        category: '$meal.category',
        size: '$meal.size',
        image_name: '$meal.image_name',
        cal: '$meal.cal',
        fats: '$meal.fats',
        carbs: '$meal.carbs',
        fiber: '$meal.fiber',
        prot: '$meal.prot',
        sodium: '$meal.sodium',
        sugar: '$meal.sugar',
        meal1: '$meal.meal1',
        meal2: '$meal.meal2',
        meal3: '$meal.meal3',
        meal4: '$meal.meal4',
        meal5: '$meal.meal5',
        meal6: '$meal.meal6',
        meal_created_at: '$meal.createdAt',
        meal_update_at: '$meal.updateAt',
      },
    },
    {
      $facet: {
        edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
        pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
  ])

  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

const paginateCombinedCat = async (model, search, page, limit) => {
  limit = Number(limit) || 10
  page = Number(page) || 1
  const skip = Number(page - 1) * Number(limit)
  const endIndex = parseInt()
  let data

  data = await model.aggregate([
    {
      $match: {
        name: { $regex: search, $options: 'i' },
        category: { $in: ['Carb, Fruit', 'F-Carb'] },
      },
    },
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    {
      $facet: {
        edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
        pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
  ])

  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

const getCombinedCat = async (model, page, limit) => {
  limit = Number(limit) || 10
  page = Number(page) || 1
  // category = category || null
  const skip = Number(page - 1) * Number(limit)
  const endIndex = parseInt()
  let data
  data = await model.aggregate([
    {
      $match: {
        category: { $in: ['Carb, Fruit', 'F-Carb'] },
      },
    },
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    {
      $facet: {
        edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
        pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
  ])
  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

const getCombinedPopulateCatSearch = async (
  model,
  userId,
  page,
  limit,
  search
) => {
  console.log('user_id', userId)
  console.log('search', search)
  limit = Number(limit) || 10
  page = Number(page) || 1
  const skip = Number(page - 1) * Number(limit)
  let id = mongoose.Types.ObjectId(userId)
  data = await model.aggregate([
    { $match: { user_id: { $in: [id] } } },
    {
      $lookup: {
        from: 'meal',
        localField: 'meal_id',
        foreignField: '_id',
        as: 'meal',
      },
    },
    {
      $unwind: '$meal',
    },
    {
      $match: {
        'meal.category': { $in: ['Carb, Fruit', 'F-Carb'] },
        'meal.name': { $regex: search, $options: 'i' },
      },
    },
    {
      $project: {
        _id: '$meal._id',
        // meal_id: 1,
        user_id: 1,
        createdAt: 1,
        updateAt: 1,
        name: '$meal.name',
        mediterranean: '$meal.mediterranean',
        paleo: '$meal.paleo',
        pescatarian: '$meal.pescatarian',
        vegan: '$meal.vegan',
        cooking_time_minutes: '$meal.cooking_time_minutes',
        directions: '$meal.directions',
        food_benefits: '$meal.food_benefits',
        grocery_list_name: '$meal.grocery_list_name',
        category: '$meal.category',
        size: '$meal.size',
        image_name: '$meal.image_name',
        cal: '$meal.cal',
        fats: '$meal.fats',
        carbs: '$meal.carbs',
        fiber: '$meal.fiber',
        prot: '$meal.prot',
        sodium: '$meal.sodium',
        sugar: '$meal.sugar',
        meal1: '$meal.meal1',
        meal2: '$meal.meal2',
        meal3: '$meal.meal3',
        meal4: '$meal.meal4',
        meal5: '$meal.meal5',
        meal6: '$meal.meal6',
        meal_created_at: '$meal.createdAt',
        meal_update_at: '$meal.updateAt',
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $facet: {
        edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
        pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
  ])

  // console.log('data', data)
  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

const paginatePopulateCombinedCat = async (model, userId, page, limit) => {
  // console.log('user_id', userId)
  let id = mongoose.Types.ObjectId(userId)
  console.log('id', id)
  limit = Number(limit) || 10
  page = Number(page) || 1
  const skip = Number(page - 1) * Number(limit)
  let data

  data = await model.aggregate([
    { $match: { user_id: { $in: [id] } } },
    {
      $lookup: {
        from: 'meal',
        localField: 'meal_id',
        foreignField: '_id',
        as: 'meal',
      },
    },
    {
      $unwind: '$meal',
    },
    {
      $match: { 'meal.category': { $in: ['Carb, Fruit', 'F-Carb'] } },
    },
    {
      $project: {
        _id: '$meal._id',
        // meal_id: 1,
        user_id: 1,
        createdAt: 1,
        updateAt: 1,
        name: '$meal.name',
        mediterranean: '$meal.mediterranean',
        paleo: '$meal.paleo',
        pescatarian: '$meal.pescatarian',
        vegan: '$meal.vegan',
        cooking_time_minutes: '$meal.cooking_time_minutes',
        directions: '$meal.directions',
        food_benefits: '$meal.food_benefits',
        grocery_list_name: '$meal.grocery_list_name',
        category: '$meal.category',
        size: '$meal.size',
        image_name: '$meal.image_name',
        cal: '$meal.cal',
        fats: '$meal.fats',
        carbs: '$meal.carbs',
        fiber: '$meal.fiber',
        prot: '$meal.prot',
        sodium: '$meal.sodium',
        sugar: '$meal.sugar',
        meal1: '$meal.meal1',
        meal2: '$meal.meal2',
        meal3: '$meal.meal3',
        meal4: '$meal.meal4',
        meal5: '$meal.meal5',
        meal6: '$meal.meal6',
        meal_created_at: '$meal.createdAt',
        meal_update_at: '$meal.updateAt',
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $facet: {
        edges: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
        pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
  ])

  // console.log('data', data)
  data = data[0]

  if (data && data.pageInfo[0] && data.pageInfo[0].count) {
    data.pageInfo[0].totalPages = parseInt(
      (parseInt(data.pageInfo[0].count) + parseInt(limit) - 1) / parseInt(limit)
    )
  }

  return data
}

module.exports = {
  insert,
  find,
  findOne,
  updateOne,
  deleteOne,
  deleteMany,
  aggregate,
  newAggregate,
  count,
  findOneAndUpdate,
  update,
  paginateByCategory,
  paginate,
  paginatePopulate,
  paginateAndSearch,
  searchFavouriteMeal,
  paginatePopulateSearch,
  paginateCombinedCat,
  getCombinedCat,
  getCombinedPopulateCatSearch,
  paginatePopulateCombinedCat,
}
