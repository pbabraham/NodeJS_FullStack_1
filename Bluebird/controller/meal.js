const mongoose = require('mongoose')
const { responseModel } = require('../model')
const { query } = require('../query')
const _ = require('lodash')
const fs = require('fs')
const csv = require('fast-csv')
const { fileUpload } = require('../service')
const mealService = require('../service/mealService')
let collection = mongoose.model('meal')
let mealModel = require('../schema/meal')
let userMealModel = require('../schema/usermeal')
let { meal, validate } = require('../schema/meal')
const AWS = require('aws-sdk')
const { result, chunk } = require('lodash')
const ID = process.env.aws_access_id
const SECRET = process.env.aws_secret_key
const ProfileBucket = 'mealuserprofilephoto'
const MealplanPdfBucket = 'mealpdfs'
const MealplanGorBucket = 'mealgrocerie'
const MealFoodBucket = 'mealfood'
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
})
const favouriteModel = require('../schema/favourite')
const recentModel = require('../schema/recent')

exports.addnewmeal = async function (req) {
  try {
    const MealFoodBucket = 'mealfood'

    //console.log("body",req.body);
    var timestamp = Date.now()
    var localImage = req.body.image_name
    var mimetype = req.body.mimetype
    var originalname = req.body.originalname
    var imageRemoteName = timestamp + '-' + originalname
    var splitpath = localImage.split(process.env.serverUrl)[1]
    //console.log(splitpath);
    var fileContent = fs.readFileSync('./public/meal/' + splitpath)

    //console.log(imageRemoteName);

    var para = {
      Key: imageRemoteName,
      ACL: 'public-read',
      Body: fileContent,
      Bucket: MealFoodBucket,
      ContentType: mimetype,
    }

    //console.log("params",para);

    const s3Response = await s3.upload(para).promise()
    //console.log("s3Response",s3Response);

    if (s3Response) {
      var imageurl = s3Response.Location
      req.body.image_name = imageurl
      //console.log("imageurl",imageurl);

      let addnewmeal = await query.insert(collection, req.body)
      if (addnewmeal) {
        var filepath = localImage
        await fileUpload.deletefile(filepath)
        return responseModel.successResponse(
          'new meal added sucessfully.',
          addnewmeal
        )
      }
    }

    // let addnewmeal = await query.insert(collection,req.body);
    // return responseModel.successResponse("new meal added sucessfully.", addnewmeal);
  } catch (err) {
    var filepath = req.body.image_name
    await fileUpload.deletefile(filepath)
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while addeing new meal: ' + errMessage
    )
  }
}

exports.mealBulkUpload = async (req, res) => {
  try {
    let existingMeals = await collection.find()

    if (req.file == undefined) {
      return res.status(201).send({
        message: 'Please upload a CSV file!',
        success: false,
        code: 201,
      })
    }
    let meals = []
    let newMeals = []
    let oldMeal = []

    function validateCsvRow(row, i) {
      let rowNumber = i + 2
      let errorList = []
      if (!Boolean(row.mediterranean) || row.mediterranean == '') {
        errorList.push(`Invalid Value for mediterranean at row : ${rowNumber}`)
      }
      if (!Boolean(row.pescatarian) || row.pescatarian == '') {
        errorList.push(`Invalid Value for pescatarian at row : ${rowNumber}`)
      }
      if (!Boolean(row.paleo) || row.paleo == '') {
        errorList.push(`Invalid Value for paleo at row : ${rowNumber}`)
      }
      if (!Boolean(row.vegan) || row.vegan == '') {
        errorList.push(`Invalid Value for vegan at row : ${rowNumber}`)
      }
      if (row.cooking_time_minutes == '') {
        errorList.push(
          `Invalid Value for cooking_time_minutes at row : ${rowNumber}`
        )
      }
      if (row.food_benefits == '') {
        errorList.push(`Invalid Value for food_benefits at row : ${rowNumber}`)
      }
      if (row.name == '') {
        errorList.push(`Invalid Value for name at row : ${rowNumber}`)
      }
      if (!(typeof row.category === 'string') || row.category == '') {
        errorList.push(`Invalid Value for category at row : ${rowNumber}`)
      }
      if (!(typeof row.size === 'string') || row.size == '') {
        errorList.push(`Invalid Value for size at row : ${rowNumber}`)
      }
      if (
        row.image_name ||
        !(typeof row.image_name === 'string') ||
        row.image_name == ''
      ) {
        var imgUrl = row.image_name
        var checkUrl = imgUrl.match(
          /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
        )
        if (checkUrl == null)
          errorList.push(
            `Invalid Value for image_name or image url at row : ${rowNumber}`
          )
      }
      if (row.cal == '' || row.cal == null) {
        errorList.push(`Invalid Value for cal at row : ${rowNumber}`)
      }
      if (row.fats == '' || row.fats == null) {
        errorList.push(`Invalid Value for fats at row : ${rowNumber}`)
      }
      if (row.carbs == '' || row.carbs == null) {
        errorList.push(`Invalid Value for carbs at row : ${rowNumber}`)
      }
      if (row.prot == '' || row.prot == null) {
        errorList.push(`Invalid Value for prot at row : ${rowNumber}`)
      }
      if (row.fiber == '') {
        errorList.push(`Invalid Value for fiber at row : ${rowNumber}`)
      }
      if (row.sodium == '') {
        errorList.push(`Invalid Value for sodium at row : ${rowNumber}`)
      }
      if (row.sugar == '') {
        errorList.push(`Invalid Value for sugar at row : ${rowNumber}`)
      }
      if (!Boolean(row.meal1) || row.meal1 == '') {
        errorList.push(`Invalid Value for meal1 at row : ${rowNumber}`)
      }
      if (!Boolean(row.meal2) || row.meal2 == '') {
        errorList.push(`Invalid Value for meal2 at row : ${rowNumber}`)
      }
      if (!Boolean(row.meal3) || row.meal3 == '') {
        errorList.push(`Invalid Value for meal3 at row : ${rowNumber}`)
      }
      if (!Boolean(row.meal4) || row.meal4 == '') {
        errorList.push(`Invalid Value for meal4 at row : ${rowNumber}`)
      }
      if (!Boolean(row.meal5) || row.meal5 == '') {
        errorList.push(`Invalid Value for meal5 at row : ${rowNumber}`)
      }
      if (!Boolean(row.meal6) || row.meal6 == '') {
        errorList.push(`Invalid Value for meal6 at row : ${rowNumber}`)
      }
      return errorList
    }
    async function validateCsvData(rows) {
      let csvErrorList = []
      for (let i = 0; i < rows.length; i++) {
        const rowError = await validateCsvRow(rows[i], i)
        if (rowError.length > 0) {
          csvErrorList.push(rowError)
        }
      }
      if (csvErrorList.length > 0) {
        return csvErrorList
      }
      return
    }

    let path = './public/meal/' + req.file.filename
    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true }))
      .on('headers', (headers) => {
        console.log(headers)
        if (
          !(
            headers.includes('pescatarian') &&
            headers.includes('vegan') &&
            headers.includes('mediterranean') &&
            headers.includes('paleo') &&
            headers.includes('grocery_list_name') &&
            headers.includes('food_benefits') &&
            headers.includes('category') &&
            headers.includes('image_name') &&
            headers.includes('cooking_time_minutes') &&
            headers.includes('directions') &&
            headers.includes('name') &&
            headers.includes('size') &&
            headers.includes('cal') &&
            headers.includes('fats') &&
            headers.includes('fiber') &&
            headers.includes('sodium') &&
            headers.includes('carbs') &&
            headers.includes('prot') &&
            headers.includes('sugar') &&
            headers.includes('meal1') &&
            headers.includes('meal2') &&
            headers.includes('meal3') &&
            headers.includes('meal4') &&
            headers.includes('meal5') &&
            headers.includes('meal6')
          )
        ) {
          return res.status(203).send({
            code: 203,
            success: false,
            message:
              'CSV format not matched, please upload file with correct format',
            error: 'CSV Format not matched',
          })
        }
      })
      .on('error', (error) => {
        throw error.message
      })
      .on('data', (row) => {
        meals.push(row)
      })
      .on('end', async (rowCount) => {
        console.log(`Parsed ${rowCount} rows`)
        const validationError = await validateCsvData(meals)
        if (validationError) {
          return res.status(203).send({
            code: 203,
            success: false,
            message: 'Please fill correct data in your CSV File',
            error: validationError,
          })
        } else {
          //differentiate existing meals and new meals
          for (let i = 0; i < meals.length; i++) {
            let filteredData = existingMeals.filter(
              (elem) => elem._id == meals[i]._id
            )
            if (filteredData.length > 0) {
              oldMeal.push(meals[i])
            } else {
              newMeals.push(meals[i])
            }
          }
        }

        //inserting new meals
        console.log(oldMeal.length)
        console.log(newMeals.length)
        let uploadResult
        let updateResult

        const oldMealSets = (oldMealArr, size) =>
          Array.from({ length: Math.ceil(oldMealArr.length / size) }, (v, i) =>
            oldMealArr.slice(i * size, i * size + size)
          )

        const listOldMealChunck = oldMealSets(oldMeal, 500)
        console.log('old meal chunck meal length:' + listOldMealChunck.length)

        const newMealSets = (newMealArr, size) =>
          Array.from({ length: Math.ceil(newMealArr.length / size) }, (v, i) =>
            newMealArr.slice(i * size, i * size + size)
          )
        const listNewMealChunck = newMealSets(newMeals, 500)
        console.log('new meals chunk length: ' + listNewMealChunck.length)

        try {
          for (let k = 0; k < listNewMealChunck.length; k++) {
            uploadResult = listNewMealChunck[k].map(async (val) => {
              await collection.insertMany({
                mediterranean: val.mediterranean,
                paleo: val.paleo,
                pescatarian: val.pescatarian,
                vegan: val.vegan,
                cooking_time_minutes: val.cooking_time_minutes,
                directions: val.directions,
                food_benefits: val.food_benefits,
                name: val.name,
                grocery_list_name: val.grocery_list_name,
                category: val.category,
                size: val.size,
                image_name: val.image_name,
                cal: val.cal,
                fats: val.fats,
                carbs: val.carbs,
                fiber: val.fiber,
                prot: val.prot,
                sodium: val.sodium,
                sugar: val.sugar,
                meal1: val.meal1,
                meal2: val.meal2,
                meal3: val.meal3,
                meal4: val.meal4,
                meal5: val.meal5,
                meal6: val.meal6,
              })
            })
          }
        } catch (err) {
          return res.status(203).send({
            error: err.name,
            message: err.message,
            success: false,
            code: 203,
          })
        }

        try {
          for (let m = 0; m < listOldMealChunck.length; m++) {
            updateResult = listOldMealChunck[m].map(async (val) => {
              await collection.findOneAndUpdate(
                { _id: val._id },
                {
                  $set: {
                    mediterranean: val.mediterranean,
                    paleo: val.paleo,
                    pescatarian: val.pescatarian,
                    vegan: val.vegan,
                    cooking_time_minutes: val.cooking_time_minutes,
                    directions: val.directions,
                    food_benefits: val.food_benefits,
                    name: val.name,
                    grocery_list_name: val.grocery_list_name,
                    category: val.category,
                    size: val.size,
                    image_name: val.image_name,
                    cal: val.cal,
                    fats: val.fats,
                    carbs: val.carbs,
                    fiber: val.fiber,
                    prot: val.prot,
                    sodium: val.sodium,
                    sugar: val.sugar,
                    meal1: val.meal1,
                    meal2: val.meal2,
                    meal3: val.meal3,
                    meal4: val.meal4,
                    meal5: val.meal5,
                    meal6: val.meal6,
                    updateAt: Date.now(),
                  },
                }
              )
            })
          }
        } catch (err) {
          return res.status(203).send({
            error: err.name,
            message: err.message,
            success: false,
            code: 203,
          })
        }
        if (uploadResult || updateResult) {
          return res.status(200).send({
            message: 'Successfully Uploaded CSV file!',
            success: true,
            code: 200,
          })
        } else {
          return res.status(203).send({
            message: 'Failed to uploaded CSV file!',
            success: false,
            code: 201,
          })
        }
      })
  } catch (err) {
    return res.status(203).send({
      message: err,
      success: false,
      code: 203,
    })
  }
}

exports.deleteDuplicateMeal = async (req, res) => {
  try {
    let allMeals = await collection.find({ name: 'Shrimp Cakes' }, 'name size')
    console.log(allMeals.length)
    return res.status(200).send({
      message: 'Successful',
      success: true,
      code: 200,
    })
  } catch (error) {}
}

exports.updatemeal = async function (req) {
  try {
    if (req.body.originalname == undefined) {
      //console.log("no image upload direct update");
      let findmeal = await query.findOne(collection, { _id: req.body.meal_id })
      if (findmeal) {
        var mealid = req.body.meal_id
        var updatemealdata = req.body
        updatemealdata.updateAt = Date.now()
        delete updatemealdata.file
        delete updatemealdata.meal_id

        let updatemeal = await query.findOneAndUpdate(
          collection,
          { _id: mealid },
          updatemealdata
        )
        return responseModel.successResponse(
          'meal updated sucessfully.',
          updatemeal
        )
      } else {
        return responseModel.failResponse('No meal food found.')
      }
    } else {
      //console.log("image upload and update");
      const MealFoodBucket = 'mealfood'
      var timestamp = Date.now()
      var mealid = req.body.meal_id
      var localImage = req.body.image_name
      var mimetype = req.body.mimetype
      var originalname = req.body.originalname
      var imageRemoteName = timestamp + '-' + originalname
      var splitpath = localImage.split(process.env.serverUrl)[1]
      var fileContent = fs.readFileSync('./public/meal/' + splitpath)

      var para = {
        Key: imageRemoteName,
        ACL: 'public-read',
        Body: fileContent,
        Bucket: MealFoodBucket,
        ContentType: mimetype,
      }

      const s3Response = await s3.upload(para).promise()
      //console.log("s3Response",s3Response);

      if (s3Response) {
        var imageurl = s3Response.Location
        req.body.image_name = imageurl

        var updatemealdata = req.body
        updatemealdata.updateAt = Date.now()
        delete updatemealdata.file
        delete updatemealdata.meal_id
        delete updatemealdata.originalname
        delete updatemealdata.mimetype

        let updatemeal = await query.findOneAndUpdate(
          collection,
          { _id: mealid },
          updatemealdata
        )
        if (updatemeal) {
          var filepath = localImage
          await fileUpload.deletefile(filepath)
        }
        return responseModel.successResponse(
          'meal updated sucessfully.',
          updatemeal
        )
      }
    }
  } catch (err) {
    var filepath = req.body.image_name
    await fileUpload.deletefile(filepath)
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating meal food: ' + errMessage
    )
  }
}

exports.deletemeal = async function (req) {
  try {
    let findmeal = await query.findOne(collection, { _id: req.params.meal_id })
    if (findmeal) {
      var imageurl = findmeal.image_name
      var split = imageurl.split('')[1]
      var param = {
        Bucket: MealFoodBucket,
        Key: split,
      }

      var deleteMealPhoto = await s3.deleteObject(param).promise()
      let deletemeal = await query.deleteOne(collection, {
        _id: req.params.meal_id,
      })
      return responseModel.successResponse(
        'Meal deleted sucessfully.',
        deletemeal
      )
    } else {
      return responseModel.failResponse('Meal not found.')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while deleting meal: ' + errMessage
    )
  }
}

exports.listmeal = async function (req) {
  try {
    var pageNo = parseInt(req.query.pageNo)
    var limit = parseInt(req.query.limit)
    searchText = req.query.searchText
    let filter = {}

    if (pageNo < 0 || pageNo === 0) {
      return responseModel.successResponse(
        'invalid page number, should start with 1'
      )
    }

    let searchTextObj = [
      {
        $or: [
          { name: { $regex: searchText, $options: 'i' } },
          { grocery_list_name: { $regex: searchText, $options: 'i' } },
          { category: { $regex: searchText, $options: 'i' } },
        ],
      },
    ]

    searchText ? (filter.$or = searchTextObj) : null

    let QueryArray = [{ $match: filter }]
    if (limit && pageNo) {
      QueryArray.push({
        $facet: {
          mealList: [{ $skip: limit * (pageNo - 1) }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      })
    }

    let allMeal = await query.aggregate(collection, QueryArray)
    //console.log("allMeal",allMeal)

    if (limit && pageNo) {
      allMeal = {
        meal_list: allMeal[0].mealList,
        total_count: allMeal[0].totalCount[0]
          ? allMeal[0].totalCount[0].count
          : 0,
      }
    }

    return responseModel.successResponse('meal list', allMeal)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while getting meal list: ' + errMessage
    )
  }
}

exports.getById = async function (req) {
  try {
    let Category = await query.findOne(collection, {
      _id: req.params.categoryId,
    })
    return responseModel.successResponse('get Category ', Category)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse('Category not get', {}, errMessage)
  }
}

exports.removeAll = async function (req) {
  try {
    //console.log("array",req.body.categoryarray)
    let findcategory = await query.find(collection, {
      _id: { $in: req.body.categoryarray },
    })
    //console.log("findcategory==",findcategory)
    let images = _.map(findcategory, 'image')
    //console.log(images)

    for (i = 0; i < images.length; i++) {
      deletepath = images[i].split(process.env.serverUrl)[1]
      //console.log("deletepath",deletepath)
      fs.unlinkSync('public/' + deletepath, function (err) {
        if (err) throw err
        //console.log("File deleted!");
      })
    }

    let deletecategory = await query.deleteMany(collection, {
      _id: { $in: req.body.categoryarray },
    })
    if (deletecategory) {
      return responseModel.successResponse('Category deleted', deletecategory)
    } else {
      return responseModel.failResponse('Category not deleted.')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse('Category not delete', errMessage)
  }
}

exports.getMealsWithSameName = async function (req) {
  let { page, limit, name } = req.body
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10

  // let result = await query.findOne(collection, { _id: meal_id })
  // if (!result) {
  //   return responseModel.failResponse('meal with id not found.')
  // }

  let mealsList = await mealModel.aggregate([
    { $match: { name: { $in: [name] } } },
    // {
    //   $facet: {
    //     edges: [{ $skip: limit * (page - 1) }, { $limit: limit }],
    //     pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
    //   },
    // },
  ])
  // mealsList = mealsList[0]
  // // console.log('mealsList', mealsList)
  // if (mealsList && mealsList.pageInfo[0] && mealsList.pageInfo[0].count) {
  //   mealsList.pageInfo[0].totalPages = parseInt(
  //     (parseInt(mealsList.pageInfo[0].count) + parseInt(limit) - 1) /
  //       parseInt(limit)
  //   )
  // }
  return responseModel.successResponse('get List by Name ', mealsList)
}

exports.searchMealByCategory = async function (req) {
  let { search, category, page, limit } = req.body
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10

  console.log('page', page)
  console.log('search', search)
  const CATEGORIES = {
    0: 'Protein',
    1: 'Carb',
    2: 'Fats',
    3: 'Carb, Fruit/F-Carb',
    4: 'All',
  }
  console.log('category', CATEGORIES[category])

  let categoryList
  if (search && CATEGORIES[category] === 'Carb, Fruit/F-Carb') {
    categoryList = await query.paginateCombinedCat(
      mealModel,
      search,
      parseInt(page),
      parseInt(limit)
    )
  } else if (search && CATEGORIES[category] !== 'All') {
    categoryList = await query.paginateAndSearch(
      mealModel,
      search,
      parseInt(page),
      parseInt(limit),
      CATEGORIES[category]
    )

    // console.log('catgoryList', categoryList)
  } else if (search && CATEGORIES[category] === 'All') {
    categoryList = await query.paginateAndSearch(
      mealModel,
      search,
      parseInt(page),
      parseInt(limit)
    )
  } else {
    // page = parseInt(page) || 1
    // limit = parseInt(limit) || 10
    if (CATEGORIES[category] === 'Carb, Fruit/F-Carb') {
      categoryList = await query.getCombinedCat(
        mealModel,
        parseInt(page),
        parseInt(limit)
      )
    } else if (CATEGORIES[category] === 'All') {
      console.log('all category')
      categoryList = await query.paginate(
        mealModel,
        parseInt(page),
        parseInt(limit)
      )
    } else {
      categoryList = await query.paginateByCategory(
        mealModel,
        CATEGORIES[category],
        parseInt(page),
        parseInt(limit)
      )
    }
  }

  // looping and checking if each entry is in favourite
  for (let doc of categoryList.edges) {
    let result = await query.findOne(favouriteModel, {
      meal_id: mongoose.Types.ObjectId(doc._id),
      user_id: req.authenticationUser.authId,
    })
    // console.log('result', result)
    if (result) {
      doc.isFavourite = true
    } else {
      doc.isFavourite = false
    }
  }

  return responseModel.successResponse(
    `${CATEGORIES[category]} Search Results `,
    categoryList
  )
}

exports.addMealToFavourites = async (req) => {
  console.log('req', req.authenticationUser)
  const ifAlreadyFav = await query.findOne(favouriteModel, {
    meal_id: req.body.meal_id,
    user_id: req.authenticationUser.authId,
  })

  if (ifAlreadyFav) {
    return responseModel.successResponse('Meal Already Added to favourites')
  }

  const result = await query.insert(favouriteModel, {
    meal_id: req.body.meal_id,
    user_id: req.authenticationUser.authId,
  })
  if (result) {
    return responseModel.successResponse('Meal Added to favourites')
  }
}

exports.getFavouriteCarbs = async (req) => {
  console.log('req auth user', req.authenticationUser)
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    console.log('searching')
    results = await query.paginatePopulateSearch(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Carb',
      search
    )
  } else {
    results = await query.paginatePopulate(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Carb'
    )
  }
  for (let doc of results.edges) {
    doc.isFavourite = true
  }

  return responseModel.successResponse(`favourite Carb Meals `, results)
}

exports.getFavouriteFats = async (req) => {
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    console.log('searching')
    results = await query.paginatePopulateSearch(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Fats',
      search
    )
  } else {
    results = await query.paginatePopulate(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Fats'
    )
  }

  for (let doc of results.edges) {
    doc.isFavourite = true
  }

  return responseModel.successResponse(`favourite Fat Meals `, results)
}

exports.getFavouriteProteins = async (req) => {
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    results = await query.paginatePopulateSearch(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Protein',
      search
    )
  } else {
    results = await query.paginatePopulate(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Protein'
    )
  }

  for (let doc of results.edges) {
    doc.isFavourite = true
  }

  return responseModel.successResponse(`favourite Protein Meals `, results)
}

exports.getFavouriteFruitVeggies = async (req) => {
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    results = await query.getCombinedPopulateCatSearch(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      search
    )
  } else {
    results = await query.paginatePopulateCombinedCat(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit)
    )
  }
  for (let doc of results.edges) {
    doc.isFavourite = true
  }

  return responseModel.successResponse(`Carb, Fruit/F-Carb `, results)
}

exports.getFavoritesAll = async (req) => {
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    results = await query.paginatePopulateSearch(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      null,
      search
    )
  } else {
    results = await query.paginatePopulate(
      favouriteModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit)
    )
  }

  for (let doc of results.edges) {
    doc.isFavourite = true
  }

  return responseModel.successResponse(`All Fav `, results)
}

exports.removeFromFavourites = async (req) => {
  const { id } = req.params
  if (!id) {
    return responseModel.failResponse('meal id required in params')
  }
  const result = await query.deleteOne(favouriteModel, {
    meal_id: id,
    user_id: req.authenticationUser.authId,
  })
  return responseModel.successResponse(`removed from favourites `, result)
}

// exports.searchFavouriteMeal = async (req) => {
//   let { search, page, limit } = req.body
//   page = parseInt(page) || 1
//   limit = parseInt(limit) || 10
//   console.log('search', search)
//   const result = await query.searchFavouriteMeal(
//     favouriteModel,
//     req.authenticationUser.authId,
//     parseInt(page),
//     parseInt(limit),
//     search
//   )
//   return responseModel.successResponse(`favourites search result `, result)
// }

exports.addMealToRecent = async (meal_id, user_id) => {
  const ifAlreadyInRecent = await query.findOne(recentModel, {
    meal_id: meal_id,
    user_id: user_id,
  })

  if (ifAlreadyInRecent) {
    const deleted = await query.deleteOne(recentModel, {
      meal_id: meal_id,
      user_id: meal_id,
    })
  }

  const result = await query.insert(recentModel, {
    meal_id: meal_id,
    user_id: user_id,
  })
  if (result) {
    return responseModel.successResponse('Meal Added to Recents')
  }
}

exports.getRecentCarbs = async (req) => {
  console.log('req auth user', req.authenticationUser)
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    results = await query.paginatePopulateSearch(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Carb',
      search
    )
  } else {
    results = await query.paginatePopulate(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Carb'
    )
  }

  // looping and checking if each entry is in favourite
  for (let doc of results.edges) {
    let result = await query.findOne(favouriteModel, {
      meal_id: doc._id,
      user_id: req.authenticationUser.authId,
    })
    if (result) {
      doc.isFavourite = true
    } else {
      doc.isFavourite = false
    }
  }

  return responseModel.successResponse(`recent Carb Meals `, results)
}

exports.getRecentFats = async (req) => {
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1|| 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    results = await query.paginatePopulateSearch(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Fats',
      search
    )
  } else {
    results = await query.paginatePopulate(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Fats'
    )
  }

  // looping and checking if each entry is in favourite
  for (let doc of results.edges) {
    let result = await query.findOne(favouriteModel, {
      meal_id: doc._id,
      user_id: req.authenticationUser.authId,
    })
    if (result) {
      doc.isFavourite = true
    } else {
      doc.isFavourite = false
    }
  }

  return responseModel.successResponse(`Recent Fat Meals `, results)
}

exports.getRecentProteins = async (req) => {
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    results = await query.paginatePopulateSearch(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Protein',
      search
    )
  } else {
    results = await query.paginatePopulate(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      'Protein'
    )
  }

  // looping and checking if each entry is in favourite
  for (let doc of results.edges) {
    let result = await query.findOne(favouriteModel, {
      meal_id: doc._id,
      user_id: req.authenticationUser.authId,
    })
    if (result) {
      doc.isFavourite = true
    } else {
      doc.isFavourite = false
    }
  }

  return responseModel.successResponse(`favourite Protein Meals `, results)
}

exports.getRecentFruitVeggies = async (req) => {
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    results = await query.getCombinedPopulateCatSearch(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      search
    )
  } else {
    results = await query.paginatePopulateCombinedCat(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit)
    )
  }

  // looping and checking if each entry is in favourite
  for (let doc of results.edges) {
    let result = await query.findOne(favouriteModel, {
      meal_id: doc._id,
      user_id: req.authenticationUser.authId,
    })
    if (result) {
      doc.isFavourite = true
    } else {
      doc.isFavourite = false
    }
  }

  return responseModel.successResponse(`recent Carb, Fruit/F-Carb `, results)
}

exports.getRecentsAll = async (req) => {
  let { page, limit, search } = req.body
  console.log('req', req.body)
  page = parseInt(page) + 1 || 1
  limit = parseInt(limit) || 10
  let results
  if (search) {
    results = await query.paginatePopulateSearch(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit),
      null,
      search
    )
  } else {
    results = await query.paginatePopulate(
      recentModel,
      req.authenticationUser.authId,
      parseInt(page),
      parseInt(limit)
    )
  }

  // looping and checking if each entry is in favourite
  for (let doc of results.edges) {
    let result = await query.findOne(favouriteModel, {
      meal_id: doc._id,
      user_id: req.authenticationUser.authId,
    })
    if (result) {
      doc.isFavourite = true
    } else {
      doc.isFavourite = false
    }
  }

  return responseModel.successResponse(`Recent All `, results)
}
