const { query, userQuery } = require('../query')
const { responseModel } = require('../model')
const mongoose = require('mongoose')
let ejs = require('ejs')
const moment = require('moment')
const _ = require('lodash')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const pdf = require('html-pdf')
const MomentRange = require('moment-range')
const daterange = MomentRange.extendMoment(moment)
const pdfMake = require('pdfmake')
const AWS = require('aws-sdk')
const ID = process.env.aws_access_id
const SECRET = process.env.aws_secret_key
const ProfileBucket = 'mealuserprofilephoto'
const MealplanPdfBucket = 'mealpdfs'
const MealplanGorBucket = 'mealgrocerie'
const MealFoodBucket = 'mealfood'
var path = require('path')

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
})
const request = require('request').defaults({ encoding: null })
const fetch = require('node-fetch')

/* SERVICES */
var UserService = require('../service/userService')
const { fileUpload } = require('../service')
const { commonService, emailService } = require('../service')
const { find } = require('lodash')
const { DynamoDBStreams } = require('aws-sdk')

/* MODEL */
let collection = mongoose.model('user')
let mealcoll = mongoose.model('meal')
let usermealcoll = mongoose.model('usermeal')
let swapmealcoll = mongoose.model('swapmeal')
let premiumplancoll = mongoose.model('premiumplan')
let userphotocoll = mongoose.model('userphoto')
let useranalyticscoll = mongoose.model('useranalytics')
let appversioncoll = mongoose.model('appversion')
let caloriescoll = mongoose.model('caloriesintake')
let exercisecoll = mongoose.model('exercise')
let userexercisecoll = mongoose.model('userexercise')
let applewatchdata = mongoose.model('applewatchdata')

// console.log(new Date(new Date()));

exports.createUser = async function (data) {
  try {
    if (data.login_type == 0) {
      let userData = {
        name: data.name,
        dob: data.dob,
        age: data.age,
        gender: data.gender,
        email: data.email,
        password: data.password,
        countrycode: data.countrycode,
        mobilenumber: data.mobilenumber,
        device_token: data.device_token,
        device_type: data.device_type,
        login_type: data.login_type,
        social_key: data.social_key,
      }
      // console.log("inside register type 0")
      let newUser = await userQuery.insert(userData)
      console.log(newUser)
      return responseModel.successResponse(
        'user register successfully.',
        newUser
      )
    }
    if (data.login_type == 1 || data.login_type == 2 || data.login_type == 3) {
      let checkuser = await query.findOne(collection, {
        $and: [{ email: data.email }, { login_type: 0 }],
      })

      if (checkuser) {
        return responseModel.failResponse(
          'You are already register with this Email, try to login!'
        )
      } else {
        if (typeof data.social_key != 'undefined' && data.social_key != '') {
          //check social user
          let checksocialuser = await query.findOne(collection, {
            $and: [{ email: data.email }, { social_key: data.social_key }],
          })

          if (checksocialuser) {
            return responseModel.failResponse(
              'You are already register with this Email, try to login!'
            )
          } else {
            let userData = {
              name: data.name,
              dob: data.dob,
              age: data.age,
              gender: data.gender,
              email: data.email,
              password: data.password,
              countrycode: data.countrycode,
              mobilenumber: data.mobilenumber,
              device_token: data.device_token,
              device_type: data.device_type,
              login_type: data.login_type,
              social_key: data.social_key,
            }

            let newUser = await userQuery.socialregister(userData)
            return responseModel.successResponse(
              'user register successfully.',
              newUser
            )
          }
        } else {
          return responseModel.failResponse('Social key is required')
        }
      }
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while register user: ' + errMessage
    )
  }
}

//check user email
exports.checkEmail = async function (data) {
  try {
    let userEmail = await collection.find({ email: data.email })
    if (userEmail.length > 0) {
      return responseModel.failResponse('User with this Email already exist!')
    } else {
      return responseModel.successResponse('You may proceed !', userEmail)
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse('Error: ' + errMessage)
  }
}

//check user mobile number
exports.checkMobilenumber = async function (data) {
  // let origNum = data.mobilenumber.split(" ").join("")
  console.log(data)
  try {
    // let userMobilenumber1 = await collection.find({mobilenumber : {$in:[data.mobilenumber1 ,data.mobilenumber2 ]} });
    let userMobilenumber = await collection.find({
      $or: [{ mobilenumber: data.number1 }, { mobilenumber: data.number2 }],
    })
    if (userMobilenumber.length > 0) {
      return responseModel.failResponse(
        'User with this Mobile Number already exist !'
      )
    } else {
      return responseModel.successResponse(
        'You may proceed !',
        userMobilenumber
      )
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse('Error: ' + errMessage)
  }
}

//Fetching exercise list

exports.exerciseList = async (req) => {
  try {
    let totalExerciseList
    let exerciseList
    var limit =
      req.body.limit != '' && req.body.limit != undefined
        ? parseInt(req.body.limit)
        : 10
    var pageNo =
      req.body.pageNo != '' && req.body.pageNo != undefined
        ? parseInt(req.body.pageNo)
        : 1
    var skip = (pageNo - 1) * limit
    var total_record = limit * pageNo
    var nextPage

    if (req.body.searchText != '' && req.body.searchText != undefined) {
      let searchExercise = await exercisecoll.find({
        description: { $regex: req.body.searchText, $options: 'i' },
      })
      if (searchExercise.length > 0) {
        totalExerciseList = await exercisecoll.find(
          { description: { $regex: req.body.searchText, $options: 'i' } },
          null,
          { sort: { _id: 1 } }
        )

        exerciseList = await exercisecoll
          .find(
            { description: { $regex: req.body.searchText, $options: 'i' } },
            null,
            { sort: { _id: 1 } }
          )
          .skip(skip)
          .limit(limit)
      } else {
        return responseModel.successResponse(
          'No such exercise available !! ',
          searchExercise
        )
      }
    } else {
      totalExerciseList = await exercisecoll.find({}, null, {
        sort: { _id: 1 },
      })

      exerciseList = await exercisecoll
        .find({}, null, { sort: { _id: 1 } })
        .skip(skip)
        .limit(limit)
    }
    var total = totalExerciseList.length
    if (total_record < total) {
      nextPage = nextPage = pageNo + 1
    } else {
      nextPage = -1
    }
    var totalPages = Math.ceil(totalExerciseList.length / limit)

    return responseModel.successResponse(
      'Fetched exercise list successfully: ',
      {
        exerciseList: exerciseList,
        totalExerciseList: totalExerciseList.length,
        totalPages: exerciseList.length > 0 ? totalPages : 0,
        nextPage: nextPage,
      }
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while fetching exercise list ' + errMessage
    )
  }
}

//Add user exercise
exports.addExercise = async (req) => {
  try {
    let availableExercises = await exercisecoll.findOne({
      exerciseId: req.body.exerciseId,
    })
    console.log(availableExercises)
    let addExercise = {
      userId: req.authenticationUser.authId,
      exerciseId: availableExercises,
      calories: req.body.calories,
      date: req.body.date,
    }
    let addUserExercise = await query.insert(userexercisecoll, addExercise)
    if (addUserExercise) {
      return responseModel.successResponse(
        'exercises uploaded.',
        addUserExercise
      )
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while uploading exercise ' + errMessage
    )
  }
}

//fetch user exercise
exports.userExerciseList = async (req) => {
  try {
    let findExercise = await userexercisecoll.find({
      userId: req.authenticationUser.authId,
      date: req.body.date,
    })
    let userExerciseDetails = []
    console.log(findExercise)
    for (i = 0; i < findExercise.length; i++) {
      let userExerciseDetail = {
        _id: findExercise[i]._id,
        userId: findExercise[i].userId,
        exerciseId: findExercise[i].exerciseId.exerciseId,
        exerciseIcon: findExercise[i].exerciseId.exerciseIcon,
        calories: findExercise[i].calories,
        addedOn: findExercise[i].date,
      }
      userExerciseDetails.push(userExerciseDetail)
    }
    if (findExercise.length > 0) {
      return responseModel.successResponse(
        'User Exercise List.',
        userExerciseDetails
      )
    } else {
      return responseModel.successResponse(
        'No exercise found for the day !! ',
        userExerciseDetails
      )
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while fetching exercise ' + errMessage
    )
  }
}
//storing apple watch data
exports.appleWatchCalData = async function (req) {
  try {
    let dataExist = await query.find(applewatchdata, {
      $and: [
        { userId: req.authenticationUser.authId },
        { date: req.body.date },
      ],
    })
    console.log(dataExist)
    console.log(dataExist.length)
    if (dataExist.length > 0) {
      let updateWatchData = await query.findOneAndUpdate(
        applewatchdata,
        { userId: req.authenticationUser.authId, date: req.body.date },
        { calories: req.body.calories }
      )
      if (updateWatchData) {
        return responseModel.successResponse(
          'Watch data updated',
          updateWatchData
        )
      } else {
        return responseModel.failResponse(
          'Something wrong happend while updating apple watch data !! '
        )
      }
    } else {
      let watchData = {
        userId: req.authenticationUser.authId,
        date: req.body.date,
        calories: req.body.calories,
      }
      let storeWatchData = await query.insert(applewatchdata, watchData)
      if (storeWatchData) {
        return responseModel.successResponse(
          'Watch data stored',
          storeWatchData
        )
      } else {
        return responseModel.failResponse(
          'Something wrong happend while storing apple watch data !! '
        )
      }
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while storing watch data : ' + errMessage
    )
  }
}

//calories intake api
exports.caloriesIntake = async function (req) {
  try {
    var checkcal = await query.findOne(caloriescoll, {
      $and: [
        { user_id: req.authenticationUser.authId },
        { mealplandate: req.body.mealplandate },
        { mealId: req.body.mealId },
      ],
    })

    // var checkUserExerciseCal = await userexercisecoll.find({userId : req.authenticationUser.authId, date: req.body.mealplandate})

    // var totalUserExerciseCal = 0 ;
    // for(i=0; i<checkUserExerciseCal.length; i++){
    //   totalUserExerciseCal += checkUserExerciseCal[i].calories
    // }

    // let watchCalData = await applewatchdata.find({userId : req.authenticationUser.authId, date: req.body.mealplandate})

    // let totalBurnedCal = totalUserExerciseCal + watchCalData[0].calories
    // console.log(totalBurnedCal)

    if (!checkcal) {
      var caloriesInfo = {
        user_id: req.authenticationUser.authId,
        mealplandate: req.body.mealplandate,
        mealId: req.body.mealId,
        caloriesEaten: req.body.caloriesEaten,
        carbsEaten: req.body.carbsEaten,
        proteinEaten: req.body.proteinEaten,
        fatsEaten: req.body.fatsEaten,
        // burn : totalBurnedCal
        // burn : req.body.burn
      }
      var storecal = await query.insert(caloriescoll, caloriesInfo)
      return responseModel.successResponse('calories stored', storecal)
    } else {
      var addClories = {
        caloriesEaten: checkcal.caloriesEaten + req.body.caloriesEaten,
        carbsEaten: checkcal.carbsEaten + req.body.carbsEaten,
        proteinEaten: checkcal.proteinEaten + req.body.proteinEaten,
        fatsEaten: checkcal.fatsEaten + req.body.fatsEaten,
        // burn : totalBurnedCal
        // burn : req.body.burn
      }
      var updatecal = await query.findOneAndUpdate(
        caloriescoll,
        { _id: checkcal._id },
        { $set: addClories }
      )
      return responseModel.successResponse('calories updated', updatecal)
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse('error while storing calories data')
  }
}

exports.loginUser = async function (data) {
  try {
    ///normal login using email password
    if (data.login_type == 0) {
      let user = await userQuery.get(data)
      // console.log(user)
      // console.log(user.authId)
      if (!(user && user.authId)) {
        return responseModel.notFound('Invalid credentials ', user)
      } else {
        return responseModel.successResponse('login user successfully', user)
      }
    }

    ///social login - google,facebook
    if (data.login_type == 1 || data.login_type == 2) {
      try {
        if (typeof data.social_key != 'undefined' && data.social_key != '') {
          //Get user data
          let checksocialuser = await query.findOne(collection, {
            $and: [{ email: data.email }, { social_key: data.social_key }],
          })

          if (checksocialuser) {
            // console.log(checksocialuser);
            if (checksocialuser.device_token != data.device_token) {
              var oldtoken = checksocialuser.device_token
              var device_token = oldtoken
              var message = 'User Logout'
              var title = 'Meal Plan'
              var type = '2'

              UserService.logoutPushNotification(
                device_token,
                message,
                title,
                type
              )
            }

            let updateuser = await query.findOneAndUpdate(
              collection,
              { _id: checksocialuser._id },
              { device_token: data.device_token, device_type: data.device_type }
            )
            // console.log("--",updateuser.device_token);

            var data = await UserService.userData(updateuser)

            return responseModel.successResponse('login user success ', data)
          } else {
            return responseModel.failResponse('login user fail, No User Found')
          }
        } else {
          return responseModel.failResponse('Social key is required')
        }
      } catch (err) {
        errMessage = typeof err == 'string' ? err : err.message
        return responseModel.failResponse(
          'Error while login user: ' + errMessage
        )
      }
    }

    ///apple login
    if (data.login_type == 3) {
      try {
        if (typeof data.social_key != 'undefined' && data.social_key != '') {
          //Get user data
          let checksocialuser = await query.findOne(collection, {
            social_key: data.social_key,
          })

          if (checksocialuser) {
            // console.log(checksocialuser);
            if (checksocialuser.device_token != data.device_token) {
              var oldtoken = checksocialuser.device_token
              var device_token = oldtoken
              var message = 'User Logout'
              var title = 'Meal Plan'
              var type = '2'

              UserService.logoutPushNotification(
                device_token,
                message,
                title,
                type
              )
            }

            let updateuser = await query.findOneAndUpdate(
              collection,
              { _id: checksocialuser._id },
              { device_token: data.device_token, device_type: data.device_type }
            )
            // console.log("--",updateuser.device_token);

            var data = await UserService.userData(updateuser)

            return responseModel.successResponse('login user success ', data)
          } else {
            return responseModel.failResponse('login user fail, No User Found')
          }
        } else {
          return responseModel.failResponse('Social key is required')
        }
      } catch (err) {
        errMessage = typeof err == 'string' ? err : err.message
        return responseModel.failResponse(
          'Error while login user: ' + errMessage
        )
      }
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse('Error while login user: ' + errMessage)
  }
}

exports.updateUsers = async function (req) {
  try {
    let checkemail = await query.findOne(collection, {
      $and: [{ email: req.body.email }, { _id: { $ne: req.body.user_id } }],
    })
    if (checkemail) {
      return responseModel.failResponse('Email already exits')
    }

    var data = {
      name: req.body.name,
      gender: req.body.gender,
      dob: req.body.dob,
      age: req.body.age,
      email: req.body.email,
      mobilenumber: req.body.mobilenumber,
      countrycode: req.body.countrycode,
      updateAt: Date.now(),
    }
    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.body.user_id },
      { $set: data }
    )
    return responseModel.successResponse('user updated successfully', user.name)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user: ' + errMessage
    )
  }
}

exports.getUserProfile = async function (req) {
  try {
    let user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })
    userbody = {
      name: user.name,
      dob: user.dob,
      gender: user.gender,
      weight: user.weight ? user.weight : '',
      bodyfat: user.bodyfat ? user.bodyfat : '',
    }
    return responseModel.successResponse('user profile', userbody)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while getting user profile: ' + errMessage
    )
  }
}

exports.getUserAccount = async function (req) {
  try {
    let user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })
    userbody = {
      email: user.email,
      password: user.password,
    }
    return responseModel.successResponse('user account details', userbody)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while getting user account details: ' + errMessage
    )
  }
}

exports.deleteUserAcc = async function (req) {
  try {
    let user_id = req.authenticationUser.authId
    var dir = user_id + '/'
    const ProfileBucket = 'mealuserprofilephoto'
    await emptyS3Directory(ProfileBucket, dir)

    let user = await query.deleteOne(collection, { _id: user_id })
    let usermeal = await query.deleteMany(usermealcoll, { user_id: user_id })
    let userphoto = await query.deleteMany(userphotocoll, { user_id: user_id })
    return responseModel.successResponse(
      'Your account deleted successfully.',
      user
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while deleting user account: ' + errMessage
    )
  }
}

async function emptyS3Directory(bucket, dir) {
  const listParams = {
    Bucket: bucket,
    Prefix: dir,
  }

  const listedObjects = await s3.listObjectsV2(listParams).promise()

  if (listedObjects.Contents.length === 0) return

  const deleteParams = {
    Bucket: bucket,
    Delete: { Objects: [] },
  }

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key })
  })

  await s3.deleteObjects(deleteParams).promise()

  if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir)
}

exports.updateUserProfile = async function (req) {
  try {
    var data = {
      name: req.body.name,
      dob: req.body.dob,
      gender: req.body.gender,
      weight: req.body.weight,
      bodyfat: req.body.bodyfat,
      updateAt: Date.now(),
    }
    // var weightdata = {
    //   userweight: req.body.weight,
    //   date: Date.now()
    // };
    // var bodyfatdata = {
    //   userbodyfat: req.body.bodyfat,
    //   date: Date.now()
    // };
    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $set: data }
      // { $push: { weightarr : weightdata , bodyfatarr : bodyfatdata } }
    )

    return responseModel.successResponse('user profile updated', user)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user profile: ' + errMessage
    )
  }
}

exports.updateUserName = async function (req) {
  try {
    var data = {
      name: req.body.name,
      updateAt: Date.now(),
    }
    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $set: data }
    )
    return responseModel.successResponse('user name updated', user.name)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user name: ' + errMessage
    )
  }
}

exports.updateUserDob = async function (req) {
  try {
    var data = {
      dob: req.body.dob,
      updateAt: Date.now(),
    }
    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $set: data }
    )
    return responseModel.successResponse('user date of birth updated', user.dob)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user date of birth: ' + errMessage
    )
  }
}

exports.updateUserGender = async function (req) {
  try {
    var data = {
      gender: req.body.gender,
      updateAt: Date.now(),
    }
    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $set: data }
    )
    return responseModel.successResponse('user gender updated', user.gender)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user gender: ' + errMessage
    )
  }
}

exports.updateUserWeight = async function (req) {
  try {
    var data = {
      weight: req.body.weight,
      weightType: req.body.weightType,
      updateAt: Date.now(),
    }
    var weightdata = {
      userweight: req.body.weight,
      date: Date.now(),
    }
    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $push: { weightarr: weightdata }, $set: data }
    )
    var resdata = {
      weight: user.weight,
      weightType: user.weightType,
    }
    return responseModel.successResponse('user weigh updated', resdata)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user weigh: ' + errMessage
    )
  }
}

exports.updateUserBodyfat = async function (req) {
  try {
    var data = {
      bodyfat: req.body.bodyfat,
      updateAt: Date.now(),
    }
    var bodyfatdata = {
      userbodyfat: req.body.bodyfat,
      date: Date.now(),
    }
    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $push: { bodyfatarr: bodyfatdata }, $set: data }
    )
    return responseModel.successResponse('user bodyfat updated', user.bodyfat)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user bodyfat: ' + errMessage
    )
  }
}

exports.updateUserBodytype = async function (req) {
  try {
    var body = {
      bodytype: req.body.body.bodytype,
      carbs: req.body.body.carbs,
      protein: req.body.body.protein,
      fat: req.body.body.fat,
    }

    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $set: { body: body, updateAt: Date.now() } }
    )
    return responseModel.successResponse('user bodytype updated', user.body)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user bodytype: ' + errMessage
    )
  }
}

exports.updateUserMacro = async function (req) {
  try {
    var carbs = req.body.carbs
    var protein = req.body.protein
    var fat = req.body.fat

    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      {
        $set: {
          'body.carbs': carbs,
          'body.protein': protein,
          'body.fat': fat,
          updateAt: Date.now(),
        },
      }
    )
    return responseModel.successResponse('user macro updated', user.body)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user macro: ' + errMessage
    )
  }
}

exports.updateUserPhysicalActivity = async function (req) {
  try {
    var workouttype = req.body.workouttype
    var workpercentage = req.body.workpercentage

    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      {
        $set: {
          'workout.workouttype': workouttype,
          'workout.workpercentage': workpercentage,
          updateAt: Date.now(),
        },
      }
    )
    return responseModel.successResponse(
      'user physical activity updated',
      user.workout
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user physical activity: ' + errMessage
    )
  }
}

exports.updateUserGoal = async function (req) {
  try {
    if (req.body.goal_id == 3) {
      var data = {
        goal: req.body.goal_id,
        level: {
          leveltype: req.body.goal_sub_title,
          levelpercentage: req.body.goal_sub_percent,
        },
        updateAt: Date.now(),
      }
    } else {
      var data = {
        goal: req.body.goal_id,
      }
    }

    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $set: data }
    )
    return responseModel.successResponse('user goal updated', user.goal)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user goal: ' + errMessage
    )
  }
}

exports.updateUserDietType = async function (req) {
  try {
    var data = {
      diettype: req.body.diettype,
      updateAt: Date.now(),
    }
    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $set: data }
    )
    return responseModel.successResponse(
      'user diet type updated',
      user.diettype
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user diet type: ' + errMessage
    )
  }
}

exports.changePassword = async function (req) {
  try {
    var currentpassword = req.body.currentpassword

    let user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })
    //console.log(user.validPassword(currentpassword));

    if (user.validPassword(currentpassword)) {
      var newpassword = req.body.newpassword
      var confirmpassword = req.body.confirmpassword

      if (newpassword == confirmpassword) {
        var hashpass = await commonService.generateHash(newpassword)

        let updatepass = await query.updateOne(
          collection,
          { _id: req.authenticationUser.authId },
          {
            $set: { password: hashpass },
          }
        )

        return responseModel.successResponse(
          'Password Successfully Changed.',
          updatepass
        )
      } else {
        return responseModel.failResponse(
          'New Password and Confirm Password does not Match.'
        )
      }
    } else {
      return responseModel.failResponse(
        'You entered the wrong current password.'
      )
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while changeing password: ' + errMessage
    )
  }
}

exports.forgotPassword = async function (req) {
  try {
    let user = await query.findOne(collection, { email: req.body.email })
    var forgotPassword = false

    if (user) {
      let socialcheck = await query.find(collection, {
        $and: [{ email: req.body.email }, { login_type: { $ne: 0 } }],
      })
      //console.log("socialcheck",socialcheck);

      if (socialcheck.length > 0) {
        return responseModel.failResponse(
          'This is a social account,You can not change password.'
        )
      } else {
        var randomPassword = commonService.password_generator()
        //console.log("random pass--", randomPassword)

        let sendData = {
          name: user.name,
          email: user.email,
          message: 'Your new Mean Plan Password is : ' + randomPassword,
        }

        await commonService.sendMail(sendData).then((mailSend, err) => {
          if (err) {
            forgotPassword = false
            return responseModel.failResponse(
              'Something went wrong. Please try again.' + err
            )
          } else {
            //console.log("Mail was sent---");
            forgotPassword = true
          }
        })
        //console.log("ForgotPass", forgotPassword);

        if (forgotPassword) {
          var hashpass = await commonService.generateHash(randomPassword)

          let setNewPassword = query.updateOne(
            collection,
            { _id: user._id },
            { $set: { password: hashpass } }
          )

          return responseModel.successResponse(
            'Your password was successfully updated and sent on email.',
            setNewPassword
          )
        } else {
        }
      }
    } else {
      return responseModel.failResponse(
        'This is not a registered user email address.'
      )
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while sending email: ' + errMessage
    )
  }
}

exports.switchNotification = async function (req) {
  try {
    var data = {
      isNotification: req.body.notification,
      updateAt: Date.now(),
    }
    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $set: data }
    )
    return responseModel.successResponse(
      'Notification preference change successfully.',
      user.isNotification
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating notification preference: ' + errMessage
    )
  }
}
//working api
exports.generatemealplan = async function (req) {
  console.log(req.body)
  //req.body.body.bodytype- will be empty in case of macro selection
  try {
    var body = {
      bodytype: req.body.body.bodytype,
      carbs: req.body.body.carbs,
      protein: req.body.body.protein,
      fat: req.body.body.fat,
    }
    var dateofplan
    var planDate = req.body.planDate
    var workout = {
      workouttype: req.body.workout.workouttype,
      workpercentage: req.body.workout.workpercentage,
    }

    var goal = req.body.goal //  1 = I want to eat healthy and maintain my weight, 2 = Gain Weight, 3 = Shed body fat

    //A. Get weight
    var weight = req.body.weight
    var weightdata = {
      userweight: req.body.weight,
      date: Date.now(),
    }

    //B. Get Body Fat
    var bodyfat = req.body.bodyfat
    var bmr = req.body.bmr

    var bodyfatdata = {
      userbodyfat: req.body.bodyfat,
      date: Date.now(),
    }

    var bmrdata = {
      userbmr: req.body.bmr,
      date: Date.now(),
    }

    var diettype = req.body.diettype
    var mealpercentage = req.body.mealpercentage

    var level = {
      leveltype: req.body.level.leveltype,
      levelpercentage: req.body.level.levelpercentage,
    }

    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      {
        $set: {
          body: body,
          workout: workout,
          goal: goal,
          weight: weight,
          bodyfat: bodyfat,
          bmr: bmr,
          diettype: diettype,
          level: level,
          mealpercentage: mealpercentage,
          updateAt: Date.now(),
        },
        $push: { weightarr: weightdata, bodyfatarr: bodyfatdata },
      }
    )
    //  console.log(user)
    if (user) {
      var userweight = user.weight
      var userbodyfat = user.bodyfat
      var userphysical = user.workout.workpercentage
      var userbmr = user.bmr
      var lbm = 0
      var oz_water = 0.67 * userweight
      var cups = Math.round(oz_water / 8)

      if (userbodyfat > 0) {
        //C. get LBM (calculation in lb)
        // lbm = Math.round(userweight * (userweight * userbodyfat / 100))
        // old calculation
        lbm = Math.round(userweight - (userweight * userbodyfat) / 100)

        //D. find BMR
        userbmr = Math.round(370 + 9.79759519 * lbm)

        //<---old calc--->
        // STEP - 1

        // lbm = Math.round(userweight - (userweight * userbodyfat / 100))
        //console.log("lbm",lbm);

        // userbmr = Math.round(370 + (9.79759519 * lbm))
        //console.log("bmr",userbmr);
      }
      //E. Find TDEE
      var tdee = Math.round(userbmr * userphysical)
      var lbmdata = {
        userlbm: lbm,
        date: Date.now(),
      }

      var bmrdata = {
        userbmr: userbmr,
        date: Date.now(),
      }

      let updateuser = await query.findOneAndUpdate(
        collection,
        { _id: req.authenticationUser.authId },
        {
          $push: { lbmarr: lbmdata, bmrarr: bmrdata },
          $set: { lbm: lbm, bmr: userbmr, tdee: tdee, updateAt: Date.now() },
        }
      )

      // STEP - 2
      var total_tdee
      var mealplan1
      var mealplan2
      //goal-1
      if (updateuser.goal == 1) {
        total_tdee = updateuser.tdee
        mealplan1 = total_tdee

        var updateusermeal = await query.findOneAndUpdate(
          collection,
          { _id: req.authenticationUser.authId },
          {
            $set: {
              total_tdee: total_tdee,
              mealplan1: mealplan1,
              updateAt: Date.now(),
            },
          }
        )
      }
      //goal-2
      else if (updateuser.goal == 2) {
        total_tdee = updateuser.tdee + 500
        mealplan1 = total_tdee

        var updateusermeal = await query.findOneAndUpdate(
          collection,
          { _id: req.authenticationUser.authId },
          {
            $set: {
              total_tdee: total_tdee,
              mealplan1: mealplan1,
              updateAt: Date.now(),
            },
          }
        )
      }

      //goal-3
      else {
        // firstmealplan for 3 days
        var firstmealplan = Math.round(
          updateuser.tdee -
            (updateuser.tdee * updateuser.level.levelpercentage) / 100
        )
        // secondmealplan for 1 day
        var secondmealplan = updateuser.tdee

        total_tdee = firstmealplan + secondmealplan

        var updateusermeal = await query.findOneAndUpdate(
          collection,
          { _id: req.authenticationUser.authId },
          {
            $set: {
              mealplan1: firstmealplan,
              mealplan2: secondmealplan,
              updateAt: Date.now(),
            },
          }
        )
      }
      // STEP - 3 Calorie of meals breakdown
      if (updateusermeal.gender == 'male') {
        // MALE meal breakdown

        if (
          updateusermeal.mealplan1 != '' &&
          updateusermeal.mealplan2 != '' &&
          updateusermeal.goal == 3
        ) {
          // goal - 3 (two meal plan)
          var usercalories1 = updateusermeal.mealplan1
          var usercalories2 = updateusermeal.mealplan2
          var usercarbs = updateusermeal.body.carbs
          var userprotein = updateusermeal.body.protein
          var userfat = updateusermeal.body.fat
          var mealpercentage = updateusermeal.mealpercentage

          var preparemealplan1 = await UserService.preparemealplan1v2(
            usercalories1,
            usercarbs,
            userprotein,
            userfat,
            mealpercentage
          )
          var preparemealplan2 = await UserService.preparemealplan1v2(
            usercalories2,
            usercarbs,
            userprotein,
            userfat,
            mealpercentage
          )
          // console.log(preparemealplan1);
          // console.log(preparemealplan2);

          var userdiet = updateusermeal.diettype
          let filter
          if (userdiet == 1) {
            filter = { paleo: { $ne: 'FALSE' } }
          } else if (userdiet == 2) {
            filter = { mediterranean: { $ne: 'FALSE' } }
          } else if (userdiet == 3) {
            filter = { pescatarian: { $ne: 'FALSE' } }
          } else if (userdiet == 4) {
            filter = { vegan: { $ne: 'FALSE' } }
          } else {
            filter = {}
          }
          console.log(filter)
          let dietfilter
          var finalarrplan1 = []
          var finalarrplan2 = []
          var result = []
          var dupresult = []
          var arrplan1 = preparemealplan1
          var arrplan2 = preparemealplan2

          for (let i = 0; i < arrplan1.length; i++) {
            let checkmeal = 'meal' + [i + 1]
            var dynObj = {}
            dynObj[checkmeal] = 'TRUE'
            console.log(checkmeal)

            dietfilter = { $and: [filter, dynObj] }
            console.log(arrplan1[i].cal)
            console.log(dietfilter)

            var category = [
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
            ]

            var mealVal = {
              cal: arrplan1[i].cal,
              carb: arrplan1[i].carb,
              protein: arrplan1[i].protein,
              fat: arrplan1[i].fat,
            }

            var meal = await UserService.getmeal(
              dietfilter,
              mealVal,
              category[i]
            )
            var finalmeal = meal

            var caloriesfood = finalmeal[0].calories._id

            var carbfood = finalmeal[1].carbs._id
            var protinfood = finalmeal[2].proteins._id
            var fatsfood = finalmeal[3].fats._id
            // console.log(checkmeal)
            if (checkmeal == 'meal1') {
              var meal1_10 = caloriesfood
              var meal1_11 = carbfood
              var meal1_12 = protinfood
              var meal1_13 = fatsfood
            }
            if (checkmeal == 'meal2') {
              var meal1_20 = caloriesfood
              var meal1_21 = carbfood
              var meal1_22 = protinfood
              var meal1_23 = fatsfood
            }
            if (checkmeal == 'meal3') {
              var meal1_30 = caloriesfood
              var meal1_31 = carbfood
              var meal1_32 = protinfood
              var meal1_33 = fatsfood
            }
            if (checkmeal == 'meal4') {
              var meal1_40 = caloriesfood
              var meal1_41 = carbfood
              var meal1_42 = protinfood
              var meal1_43 = fatsfood
            }
            if (checkmeal == 'meal5') {
              var meal1_50 = caloriesfood
              var meal1_51 = carbfood
              var meal1_52 = protinfood
              var meal1_53 = fatsfood
            }
            if (checkmeal == 'meal6') {
              var meal1_60 = caloriesfood
              var meal1_61 = carbfood
              var meal1_62 = protinfood
              var meal1_63 = fatsfood
            }
            finalarrplan1.push(finalmeal)
          }

          for (let i = 0; i < arrplan2.length; i++) {
            let checkmeal = 'meal' + [i + 1]
            var dynObj = {}
            dynObj[checkmeal] = 'TRUE'
            //console.log("checkmeal",checkmeal);
            dietfilter = { $and: [filter, dynObj] }
            //  console.log(arrplan2[i].cal);
            // console.log("dietfilter",dietfilter);
            var category = [
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
            ]

            var mealVal = {
              cal: arrplan2[i].cal,
              carb: arrplan2[i].carb,
              protein: arrplan2[i].protein,
              fat: arrplan2[i].fat,
            }

            var meal = await UserService.getmeal(
              dietfilter,
              mealVal,
              category[i]
            )
            var finalmeal = meal
            var caloriesfood = finalmeal[0].calories._id
            var carbfood = finalmeal[1].carbs._id
            var protinfood = finalmeal[2].proteins._id
            var fatsfood = finalmeal[3].fats._id
            if (checkmeal == 'meal1') {
              var meal2_10 = caloriesfood
              var meal2_11 = carbfood
              var meal2_12 = protinfood
              var meal2_13 = fatsfood
            }
            if (checkmeal == 'meal2') {
              var meal2_20 = caloriesfood
              var meal2_21 = carbfood
              var meal2_22 = protinfood
              var meal2_23 = fatsfood
            }
            if (checkmeal == 'meal3') {
              var meal2_30 = caloriesfood
              var meal2_31 = carbfood
              var meal2_32 = protinfood
              var meal2_33 = fatsfood
            }
            if (checkmeal == 'meal4') {
              var meal2_40 = caloriesfood
              var meal2_41 = carbfood
              var meal2_42 = protinfood
              var meal2_43 = fatsfood
            }
            if (checkmeal == 'meal5') {
              var meal2_50 = caloriesfood
              var meal2_51 = carbfood
              var meal2_52 = protinfood
              var meal2_53 = fatsfood
            }
            if (checkmeal == 'meal6') {
              var meal2_60 = caloriesfood
              var meal2_61 = carbfood
              var meal2_62 = protinfood
              var meal2_63 = fatsfood
            }
            finalarrplan2.push(finalmeal)
          }

          //  console.log("final---1--",finalarrplan1);
          //  console.log("final---2--",finalarrplan2);

          // result = [ finalarrplan1, finalarrplan2 ] // { water_cups : cups}

          for (let i = 0; i < 3; i++) {
            // var dateofplan = new Date(new Date(moment(new Date()).add(i, 'days')).setUTCHours(0, 0, 0, 0))
            if (planDate != '') {
              dateofplan = new Date(
                new Date(moment(planDate).add(i, 'days')).setUTCHours(
                  0,
                  0,
                  0,
                  0
                )
              )
            } else {
              dateofplan = new Date(
                new Date(moment(new Date()).add(i, 'days')).setUTCHours(
                  0,
                  0,
                  0,
                  0
                )
              )
            }
            var genmeal = {
              mealplan: finalarrplan1,
              user_id: req.authenticationUser.authId,
              mealplandate: dateofplan,
              bodytype: updateusermeal.body.bodytype,
              carbs: updateusermeal.body.carbs,
              protein: updateusermeal.body.protein,
              fat: updateusermeal.body.fat,
              workouttype: updateusermeal.workout.workouttype,
              workpercentage: updateusermeal.workout.workpercentage,
              leveltype: updateusermeal.level.leveltype,
              levelpercentage: updateusermeal.level.levelpercentage,
              weight: updateusermeal.weight,
              bodyfat: updateusermeal.bodyfat,
              bmr: updateusermeal.bmr,
              diettype: updateusermeal.diettype,
              mealpercentage: updateusermeal.mealpercentage,
              usertype: updateusermeal.gender,
              total_tdee: updateusermeal.total_tdee,
              mealplan1: updateusermeal.mealplan1,
              mealplan2: updateusermeal.mealplan2
                ? updateusermeal.mealplan2
                : 0,
              mealplantype: 1,
              mealwaterdata: cups,
              total_cups_count: cups,
              usergoal: updateusermeal.goal,
              updatedAt: new Date(),
            }
            var checkmeal = await query.findOne(usermealcoll, {
              $and: [
                { user_id: req.authenticationUser.authId },
                { mealplandate: dateofplan },
              ],
            })
            if (checkmeal) {
              // update
              var storemeal = await query.findOneAndUpdate(
                usermealcoll,
                { _id: checkmeal._id },
                { $set: genmeal }
              )
              var swapmeal = {
                user_id: req.authenticationUser.authId,
                mealplandate: dateofplan,
                bodytype: updateusermeal.body.bodytype,
                carbs: updateusermeal.body.carbs,
                protein: updateusermeal.body.protein,
                fat: updateusermeal.body.fat,
                workouttype: updateusermeal.workout.workouttype,
                workpercentage: updateusermeal.workout.workpercentage,
                leveltype: updateusermeal.level.leveltype,
                levelpercentage: updateusermeal.level.levelpercentage,
                weight: updateusermeal.weight,
                bodyfat: updateusermeal.bodyfat,
                bmr: updateusermeal.bmr,
                diettype: updateusermeal.diettype,
                usertype: updateusermeal.gender,
                total_tdee: updateusermeal.total_tdee,
                mealplan1: updateusermeal.mealplan1,
                mealplan2: updateusermeal.mealplan2
                  ? updateusermeal.mealplan2
                  : 0,
                mealplantype: 1,
                mealwaterdata: cups,
                total_cups_count: cups,
                usergoal: updateusermeal.goal,
                meal10: meal1_10,
                meal11: meal1_11,
                meal12: meal1_12,
                meal13: meal1_13,
                meal20: meal1_20,
                meal21: meal1_21,
                meal22: meal1_22,
                meal23: meal1_23,
                meal30: meal1_30,
                meal31: meal1_31,
                meal32: meal1_32,
                meal33: meal1_33,
                meal40: meal1_40,
                meal41: meal1_41,
                meal42: meal1_42,
                meal43: meal1_43,
                meal50: meal1_50,
                meal51: meal1_51,
                meal52: meal1_52,
                meal53: meal1_53,
                meal60: meal1_60,
                meal61: meal1_61,
                meal62: meal1_62,
                meal63: meal1_63,
                updatedAt: new Date(),
              }
              var updateswapmeal = await query.findOneAndUpdate(
                swapmealcoll,
                { usermeal_id: checkmeal._id },
                { $set: swapmeal }
              )
            } else {
              var storemeal = await query.insert(usermealcoll, genmeal)
              if (storemeal) {
                var usermeal_id = storemeal._id
                var swapmeal = {
                  usermeal_id: usermeal_id,
                  user_id: req.authenticationUser.authId,
                  mealplandate: dateofplan,
                  bodytype: updateusermeal.body.bodytype,
                  carbs: updateusermeal.body.carbs,
                  protein: updateusermeal.body.protein,
                  fat: updateusermeal.body.fat,
                  workouttype: updateusermeal.workout.workouttype,
                  workpercentage: updateusermeal.workout.workpercentage,
                  leveltype: updateusermeal.level.leveltype,
                  levelpercentage: updateusermeal.level.levelpercentage,
                  weight: updateusermeal.weight,
                  bodyfat: updateusermeal.bodyfat,
                  bmr: updateusermeal.bmr,
                  diettype: updateusermeal.diettype,
                  usertype: updateusermeal.gender,
                  total_tdee: updateusermeal.total_tdee,
                  mealplan1: updateusermeal.mealplan1,
                  mealplan2: updateusermeal.mealplan2
                    ? updateusermeal.mealplan2
                    : 0,
                  mealplantype: 1,
                  mealwaterdata: cups,
                  total_cups_count: cups,
                  usergoal: updateusermeal.goal,
                  meal10: meal1_10,
                  meal11: meal1_11,
                  meal12: meal1_12,
                  meal13: meal1_13,
                  meal20: meal1_20,
                  meal21: meal1_21,
                  meal22: meal1_22,
                  meal23: meal1_23,
                  meal30: meal1_30,
                  meal31: meal1_31,
                  meal32: meal1_32,
                  meal33: meal1_33,
                  meal40: meal1_40,
                  meal41: meal1_41,
                  meal42: meal1_42,
                  meal43: meal1_43,
                  meal50: meal1_50,
                  meal51: meal1_51,
                  meal52: meal1_52,
                  meal53: meal1_53,
                  meal60: meal1_60,
                  meal61: meal1_61,
                  meal62: meal1_62,
                  meal63: meal1_63,
                  updatedAt: new Date(),
                }
                var saveSwapmeal = await query.insert(swapmealcoll, swapmeal)
              }
            }
          }

          for (let i = 0; i < 1; i++) {
            if (planDate != '') {
              dateofplan = new Date(
                new Date(moment(planDate).add(3, 'days')).setUTCHours(
                  0,
                  0,
                  0,
                  0
                )
              )
            } else {
              dateofplan = new Date(
                new Date(moment(new Date()).add(3, 'days')).setUTCHours(
                  0,
                  0,
                  0,
                  0
                )
              )
            }
            // var dateofplan = new Date(new Date(moment(new Date()).add(3, 'days')).setUTCHours(0, 0, 0, 0))
            var genmeal = {
              mealplan: finalarrplan2,
              user_id: req.authenticationUser.authId,
              mealplandate: dateofplan,
              bodytype: updateusermeal.body.bodytype,
              carbs: updateusermeal.body.carbs,
              protein: updateusermeal.body.protein,
              fat: updateusermeal.body.fat,
              workouttype: updateusermeal.workout.workouttype,
              workpercentage: updateusermeal.workout.workpercentage,
              leveltype: updateusermeal.level.leveltype,
              levelpercentage: updateusermeal.level.levelpercentage,
              weight: updateusermeal.weight,
              bodyfat: updateusermeal.bodyfat,
              bmr: updateusermeal.bmr,
              diettype: updateusermeal.diettype,
              mealpercentage: updateusermeal.mealpercentage,
              usertype: updateusermeal.gender,
              total_tdee: updateusermeal.total_tdee,
              mealplan1: updateusermeal.mealplan1,
              mealplan2: updateusermeal.mealplan2
                ? updateusermeal.mealplan2
                : 0,
              mealplantype: 2,
              mealwaterdata: cups,
              total_cups_count: cups,
              usergoal: updateusermeal.goal,
              updatedAt: new Date(),
            }
            var checkmeal = await query.findOne(usermealcoll, {
              $and: [
                { user_id: req.authenticationUser.authId },
                { mealplandate: dateofplan },
              ],
            })
            if (checkmeal) {
              // update
              var storemeal = await query.findOneAndUpdate(
                usermealcoll,
                { _id: checkmeal._id },
                { $set: genmeal }
              )
              var swapmeal = {
                user_id: req.authenticationUser.authId,
                mealplandate: dateofplan,
                bodytype: updateusermeal.body.bodytype,
                carbs: updateusermeal.body.carbs,
                protein: updateusermeal.body.protein,
                fat: updateusermeal.body.fat,
                workouttype: updateusermeal.workout.workouttype,
                workpercentage: updateusermeal.workout.workpercentage,
                leveltype: updateusermeal.level.leveltype,
                levelpercentage: updateusermeal.level.levelpercentage,
                weight: updateusermeal.weight,
                bodyfat: updateusermeal.bodyfat,
                bmr: updateusermeal.bmr,
                diettype: updateusermeal.diettype,
                usertype: updateusermeal.gender,
                total_tdee: updateusermeal.total_tdee,
                mealplan1: updateusermeal.mealplan1,
                mealplan2: updateusermeal.mealplan2
                  ? updateusermeal.mealplan2
                  : 0,
                mealplantype: 1,
                mealwaterdata: cups,
                total_cups_count: cups,
                usergoal: updateusermeal.goal,
                meal10: meal2_10,
                meal11: meal2_11,
                meal12: meal2_12,
                meal13: meal2_13,
                meal20: meal2_20,
                meal21: meal2_21,
                meal22: meal2_22,
                meal23: meal2_23,
                meal30: meal2_30,
                meal31: meal2_31,
                meal32: meal2_32,
                meal33: meal2_33,
                meal40: meal2_40,
                meal41: meal2_41,
                meal42: meal2_42,
                meal43: meal2_43,
                meal50: meal2_50,
                meal51: meal2_51,
                meal52: meal2_52,
                meal53: meal2_53,
                meal60: meal2_60,
                meal61: meal2_61,
                meal62: meal2_62,
                meal63: meal2_63,
                updatedAt: new Date(),
              }
              var updateswapmeal = await query.findOneAndUpdate(
                swapmealcoll,
                { usermeal_id: checkmeal._id },
                { $set: swapmeal }
              )
            } else {
              var storemeal = await query.insert(usermealcoll, genmeal)
              if (storemeal) {
                var usermeal_id = storemeal._id
                var swapmeal = {
                  usermeal_id: usermeal_id,
                  user_id: req.authenticationUser.authId,
                  mealplandate: dateofplan,
                  bodytype: updateusermeal.body.bodytype,
                  carbs: updateusermeal.body.carbs,
                  protein: updateusermeal.body.protein,
                  fat: updateusermeal.body.fat,
                  workouttype: updateusermeal.workout.workouttype,
                  workpercentage: updateusermeal.workout.workpercentage,
                  leveltype: updateusermeal.level.leveltype,
                  levelpercentage: updateusermeal.level.levelpercentage,
                  weight: updateusermeal.weight,
                  bodyfat: updateusermeal.bodyfat,
                  bmr: updateusermeal.bmr,
                  diettype: updateusermeal.diettype,
                  usertype: updateusermeal.gender,
                  total_tdee: updateusermeal.total_tdee,
                  mealplan1: updateusermeal.mealplan1,
                  mealplan2: updateusermeal.mealplan2
                    ? updateusermeal.mealplan2
                    : 0,
                  mealplantype: 1,
                  mealwaterdata: cups,
                  total_cups_count: cups,
                  usergoal: updateusermeal.goal,
                  meal10: meal2_10,
                  meal11: meal2_11,
                  meal12: meal2_12,
                  meal13: meal2_13,
                  meal20: meal2_20,
                  meal21: meal2_21,
                  meal22: meal2_22,
                  meal23: meal2_23,
                  meal30: meal2_30,
                  meal31: meal2_31,
                  meal32: meal2_32,
                  meal33: meal2_33,
                  meal40: meal2_40,
                  meal41: meal2_41,
                  meal42: meal2_42,
                  meal43: meal2_43,
                  meal50: meal2_50,
                  meal51: meal2_51,
                  meal52: meal2_52,
                  meal53: meal2_53,
                  meal60: meal2_60,
                  meal61: meal2_61,
                  meal62: meal2_62,
                  meal63: meal2_63,
                  updatedAt: new Date(),
                }
                var saveSwapmeal = await query.insert(swapmealcoll, swapmeal)
              }
            }
          }
        } else if (updateusermeal.mealplan1 != '' && updateusermeal.goal == 2) {
          // goal 2 (1 day meal)
          var usercalories1 = updateusermeal.mealplan1
          var usercarbs = updateusermeal.body.carbs
          var userprotein = updateusermeal.body.protein
          var userfat = updateusermeal.body.fat
          var mealpercentage = updateusermeal.mealpercentage

          var preparemealplan1 = await UserService.preparemealplan1v2(
            usercalories1,
            usercarbs,
            userprotein,
            userfat,
            mealpercentage
          )
          //console.log("preparemealplan1",preparemealplan1);
          var userdiet = updateusermeal.diettype
          let filter
          if (userdiet == 1) {
            filter = { paleo: { $ne: 'FALSE' } }
          } else if (userdiet == 2) {
            filter = { mediterranean: { $ne: 'FALSE' } }
          } else if (userdiet == 3) {
            filter = { pescatarian: { $ne: 'FALSE' } }
          } else if (userdiet == 4) {
            filter = { vegan: { $ne: 'FALSE' } }
          } else {
            filter = {}
          }

          let dietfilter
          var finalarrplan1 = []
          var result = []
          const arrplan1 = preparemealplan1

          for (let i = 0; i < arrplan1.length; i++) {
            let checkmeal = 'meal' + [i + 1]
            var dynObj = {}
            dynObj[checkmeal] = 'TRUE'

            dietfilter = { $and: [filter, dynObj] }
            //  console.log(arrplan1[i].cal);
            // console.log("dietfilter",dietfilter);

            var category = [
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
            ]

            var mealVal = {
              cal: arrplan1[i].cal,
              carb: arrplan1[i].carb,
              protein: arrplan1[i].protein,
              fat: arrplan1[i].fat,
            }

            var meal = await UserService.getmeal(
              dietfilter,
              mealVal,
              category[i]
            )
            var finalmeal = meal
            var caloriesfood = finalmeal[0].calories._id
            var carbfood = finalmeal[1].carbs._id
            var protinfood = finalmeal[2].proteins._id
            var fatsfood = finalmeal[3].fats._id
            if (checkmeal == 'meal1') {
              var meal10 = caloriesfood
              var meal11 = carbfood
              var meal12 = protinfood
              var meal13 = fatsfood
            }
            if (checkmeal == 'meal2') {
              var meal20 = caloriesfood
              var meal21 = carbfood
              var meal22 = protinfood
              var meal23 = fatsfood
            }
            if (checkmeal == 'meal3') {
              var meal30 = caloriesfood
              var meal31 = carbfood
              var meal32 = protinfood
              var meal33 = fatsfood
            }
            if (checkmeal == 'meal4') {
              var meal40 = caloriesfood
              var meal41 = carbfood
              var meal42 = protinfood
              var meal43 = fatsfood
            }
            if (checkmeal == 'meal5') {
              var meal50 = caloriesfood
              var meal51 = carbfood
              var meal52 = protinfood
              var meal53 = fatsfood
            }
            if (checkmeal == 'meal6') {
              var meal60 = caloriesfood
              var meal61 = carbfood
              var meal62 = protinfood
              var meal63 = fatsfood
            }
            finalarrplan1.push(finalmeal)
          }

          // console.log("final---1--",finalarrplan1);
          if (planDate != '') {
            dateofplan = new Date(
              new Date(moment(planDate).add(0, 'days')).setUTCHours(0, 0, 0, 0)
            )
          } else {
            dateofplan = new Date(
              new Date(moment(new Date()).add(0, 'days')).setUTCHours(
                0,
                0,
                0,
                0
              )
            )
          }
          var genmeal = {
            mealplan: finalarrplan1,
            user_id: req.authenticationUser.authId,
            mealplandate: dateofplan,
            bodytype: updateusermeal.body.bodytype,
            carbs: updateusermeal.body.carbs,
            protein: updateusermeal.body.protein,
            fat: updateusermeal.body.fat,
            workouttype: updateusermeal.workout.workouttype,
            workpercentage: updateusermeal.workout.workpercentage,
            leveltype: updateusermeal.level.leveltype,
            levelpercentage: updateusermeal.level.levelpercentage,
            weight: updateusermeal.weight,
            bodyfat: updateusermeal.bodyfat,
            bmr: updateusermeal.bmr,
            diettype: updateusermeal.diettype,
            mealpercentage: updateusermeal.mealpercentage,
            usertype: updateusermeal.gender,
            total_tdee: updateusermeal.total_tdee,
            mealplan1: updateusermeal.mealplan1,
            mealplan2: updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
            mealplantype: 1,
            mealwaterdata: cups,
            total_cups_count: cups,
            usergoal: updateusermeal.goal,
            updatedAt: new Date(),
          }
          var checkmeal = await query.findOne(usermealcoll, {
            $and: [
              { user_id: req.authenticationUser.authId },
              { mealplandate: dateofplan },
            ],
          })
          if (checkmeal) {
            // update
            var storemeal = await query.findOneAndUpdate(
              usermealcoll,
              { _id: checkmeal._id },
              { $set: genmeal }
            )
            var swapmeal = {
              user_id: req.authenticationUser.authId,
              mealplandate: dateofplan,
              bodytype: updateusermeal.body.bodytype,
              carbs: updateusermeal.body.carbs,
              protein: updateusermeal.body.protein,
              fat: updateusermeal.body.fat,
              workouttype: updateusermeal.workout.workouttype,
              workpercentage: updateusermeal.workout.workpercentage,
              leveltype: updateusermeal.level.leveltype,
              levelpercentage: updateusermeal.level.levelpercentage,
              weight: updateusermeal.weight,
              bodyfat: updateusermeal.bodyfat,
              bmr: updateusermeal.bmr,
              diettype: updateusermeal.diettype,
              usertype: updateusermeal.gender,
              total_tdee: updateusermeal.total_tdee,
              mealplan1: updateusermeal.mealplan1,
              mealplan2: updateusermeal.mealplan2
                ? updateusermeal.mealplan2
                : 0,
              mealplantype: 1,
              mealwaterdata: cups,
              total_cups_count: cups,
              usergoal: updateusermeal.goal,
              meal10: meal10,
              meal11: meal11,
              meal12: meal12,
              meal13: meal13,
              meal20: meal20,
              meal21: meal21,
              meal22: meal22,
              meal23: meal23,
              meal30: meal30,
              meal31: meal31,
              meal32: meal32,
              meal33: meal33,
              meal40: meal40,
              meal41: meal41,
              meal42: meal42,
              meal43: meal43,
              meal50: meal50,
              meal51: meal51,
              meal52: meal52,
              meal53: meal53,
              meal60: meal60,
              meal61: meal61,
              meal62: meal62,
              meal63: meal63,
              updatedAt: new Date(),
            }
            var updateswapmeal = await query.findOneAndUpdate(
              swapmealcoll,
              { usermeal_id: checkmeal._id },
              { $set: swapmeal }
            )
          } else {
            var storemeal = await query.insert(usermealcoll, genmeal)
            if (storemeal) {
              var usermeal_id = storemeal._id
              var swapmeal = {
                usermeal_id: usermeal_id,
                user_id: req.authenticationUser.authId,
                mealplandate: dateofplan,
                bodytype: updateusermeal.body.bodytype,
                carbs: updateusermeal.body.carbs,
                protein: updateusermeal.body.protein,
                fat: updateusermeal.body.fat,
                workouttype: updateusermeal.workout.workouttype,
                workpercentage: updateusermeal.workout.workpercentage,
                leveltype: updateusermeal.level.leveltype,
                levelpercentage: updateusermeal.level.levelpercentage,
                weight: updateusermeal.weight,
                bodyfat: updateusermeal.bodyfat,
                bmr: updateusermeal.bmr,
                diettype: updateusermeal.diettype,
                usertype: updateusermeal.gender,
                total_tdee: updateusermeal.total_tdee,
                mealplan1: updateusermeal.mealplan1,
                mealplan2: updateusermeal.mealplan2
                  ? updateusermeal.mealplan2
                  : 0,
                mealplantype: 1,
                mealwaterdata: cups,
                total_cups_count: cups,
                usergoal: updateusermeal.goal,
                meal10: meal10,
                meal11: meal11,
                meal12: meal12,
                meal13: meal13,
                meal20: meal20,
                meal21: meal21,
                meal22: meal22,
                meal23: meal23,
                meal30: meal30,
                meal31: meal31,
                meal32: meal32,
                meal33: meal33,
                meal40: meal40,
                meal41: meal41,
                meal42: meal42,
                meal43: meal43,
                meal50: meal50,
                meal51: meal51,
                meal52: meal52,
                meal53: meal53,
                meal60: meal60,
                meal61: meal61,
                meal62: meal62,
                meal63: meal63,
                updatedAt: new Date(),
              }
              var saveSwapmeal = await query.insert(swapmealcoll, swapmeal)
            }
          }
        } else {
          // goal 1 (1 day meal )
          var usercalories1 = updateusermeal.mealplan1
          var usercarbs = updateusermeal.body.carbs
          var userprotein = updateusermeal.body.protein
          var userfat = updateusermeal.body.fat
          var mealpercentage = updateusermeal.mealpercentage

          var preparemealplan1 = await UserService.preparemealplan1v2(
            usercalories1,
            usercarbs,
            userprotein,
            userfat,
            mealpercentage
          )
          //console.log("preparemealplan1--++",preparemealplan1);

          var userdiet = updateusermeal.diettype
          let filter
          if (userdiet == 1) {
            filter = { paleo: { $ne: 'FALSE' } }
          } else if (userdiet == 2) {
            filter = { mediterranean: { $ne: 'FALSE' } }
          } else if (userdiet == 3) {
            filter = { pescatarian: { $ne: 'FALSE' } }
          } else if (userdiet == 4) {
            filter = { vegan: { $ne: 'FALSE' } }
          } else {
            filter = {}
          }
          let dietfilter
          var finalarrplan1 = []
          var result = []
          const arrplan1 = preparemealplan1

          for (let i = 0; i < arrplan1.length; i++) {
            let checkmeal = 'meal' + [i + 1]
            var dynObj = {}
            dynObj[checkmeal] = 'TRUE'
            //console.log("checkmeal--->",typeof checkmeal);

            dietfilter = { $and: [filter, dynObj] }
            //  console.log(arrplan1[i].cal);
            // console.log("dietfilter",dietfilter);
            var category = [
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
            ]

            var mealVal = {
              cal: arrplan1[i].cal,
              carb: arrplan1[i].carb,
              protein: arrplan1[i].protein,
              fat: arrplan1[i].fat,
            }

            var meal = await UserService.getmeal(
              dietfilter,
              mealVal,
              category[i]
            )
            var finalmeal = meal
            var caloriesfood = finalmeal[0].calories._id
            var carbfood = finalmeal[1].carbs._id
            var protinfood = finalmeal[2].proteins._id
            var fatsfood = finalmeal[3].fats._id
            if (checkmeal == 'meal1') {
              var meal10 = caloriesfood
              var meal11 = carbfood
              var meal12 = protinfood
              var meal13 = fatsfood
            }
            if (checkmeal == 'meal2') {
              var meal20 = caloriesfood
              var meal21 = carbfood
              var meal22 = protinfood
              var meal23 = fatsfood
            }
            if (checkmeal == 'meal3') {
              var meal30 = caloriesfood
              var meal31 = carbfood
              var meal32 = protinfood
              var meal33 = fatsfood
            }
            if (checkmeal == 'meal4') {
              var meal40 = caloriesfood
              var meal41 = carbfood
              var meal42 = protinfood
              var meal43 = fatsfood
            }
            if (checkmeal == 'meal5') {
              var meal50 = caloriesfood
              var meal51 = carbfood
              var meal52 = protinfood
              var meal53 = fatsfood
            }
            if (checkmeal == 'meal6') {
              var meal60 = caloriesfood
              var meal61 = carbfood
              var meal62 = protinfood
              var meal63 = fatsfood
            }
            finalarrplan1.push(finalmeal)
          }

          //console.log("final---1--",finalarrplan1);

          if (planDate != '') {
            dateofplan = new Date(
              new Date(moment(planDate).add(0, 'days')).setUTCHours(0, 0, 0, 0)
            )
          } else {
            dateofplan = new Date(
              new Date(moment(new Date()).add(0, 'days')).setUTCHours(
                0,
                0,
                0,
                0
              )
            )
          }

          var genmeal = {
            mealplan: finalarrplan1,
            user_id: req.authenticationUser.authId,
            mealplandate: dateofplan,
            bodytype: updateusermeal.body.bodytype,
            carbs: updateusermeal.body.carbs,
            protein: updateusermeal.body.protein,
            fat: updateusermeal.body.fat,
            workouttype: updateusermeal.workout.workouttype,
            workpercentage: updateusermeal.workout.workpercentage,
            leveltype: updateusermeal.level.leveltype,
            levelpercentage: updateusermeal.level.levelpercentage,
            weight: updateusermeal.weight,
            bodyfat: updateusermeal.bodyfat,
            bmr: updateusermeal.bmr,
            diettype: updateusermeal.diettype,
            mealpercentage: updateusermeal.mealpercentage,
            usertype: updateusermeal.gender,
            total_tdee: updateusermeal.total_tdee,
            mealplan1: updateusermeal.mealplan1,
            mealplan2: updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
            mealplantype: 1,
            mealwaterdata: cups,
            total_cups_count: cups,
            usergoal: updateusermeal.goal,
            updatedAt: new Date(),
          }
          var checkmeal = await query.findOne(usermealcoll, {
            $and: [
              { user_id: req.authenticationUser.authId },
              { mealplandate: dateofplan },
            ],
          })
          if (checkmeal) {
            // update
            var storemeal = await query.findOneAndUpdate(
              usermealcoll,
              { _id: checkmeal._id },
              { $set: genmeal }
            )
            var swapmeal = {
              user_id: req.authenticationUser.authId,
              mealplandate: dateofplan,
              bodytype: updateusermeal.body.bodytype,
              carbs: updateusermeal.body.carbs,
              protein: updateusermeal.body.protein,
              fat: updateusermeal.body.fat,
              workouttype: updateusermeal.workout.workouttype,
              workpercentage: updateusermeal.workout.workpercentage,
              leveltype: updateusermeal.level.leveltype,
              levelpercentage: updateusermeal.level.levelpercentage,
              weight: updateusermeal.weight,
              bodyfat: updateusermeal.bodyfat,
              bmr: updateusermeal.bmr,
              diettype: updateusermeal.diettype,
              usertype: updateusermeal.gender,
              total_tdee: updateusermeal.total_tdee,
              mealplan1: updateusermeal.mealplan1,
              mealplan2: updateusermeal.mealplan2
                ? updateusermeal.mealplan2
                : 0,
              mealplantype: 1,
              mealwaterdata: cups,
              total_cups_count: cups,
              usergoal: updateusermeal.goal,
              meal10: meal10,
              meal11: meal11,
              meal12: meal12,
              meal13: meal13,
              meal20: meal20,
              meal21: meal21,
              meal22: meal22,
              meal23: meal23,
              meal30: meal30,
              meal31: meal31,
              meal32: meal32,
              meal33: meal33,
              meal40: meal40,
              meal41: meal41,
              meal42: meal42,
              meal43: meal43,
              meal50: meal50,
              meal51: meal51,
              meal52: meal52,
              meal53: meal53,
              meal60: meal60,
              meal61: meal61,
              meal62: meal62,
              meal63: meal63,
              updatedAt: new Date(),
            }
            var updateswapmeal = await query.findOneAndUpdate(
              swapmealcoll,
              { usermeal_id: checkmeal._id },
              { $set: swapmeal }
            )
          } else {
            var storemeal = await query.insert(usermealcoll, genmeal)
            if (storemeal) {
              var usermeal_id = storemeal._id
              var swapmeal = {
                usermeal_id: usermeal_id,
                user_id: req.authenticationUser.authId,
                mealplandate: dateofplan,
                bodytype: updateusermeal.body.bodytype,
                carbs: updateusermeal.body.carbs,
                protein: updateusermeal.body.protein,
                fat: updateusermeal.body.fat,
                workouttype: updateusermeal.workout.workouttype,
                workpercentage: updateusermeal.workout.workpercentage,
                leveltype: updateusermeal.level.leveltype,
                levelpercentage: updateusermeal.level.levelpercentage,
                weight: updateusermeal.weight,
                bodyfat: updateusermeal.bodyfat,
                bmr: updateusermeal.bmr,
                diettype: updateusermeal.diettype,
                usertype: updateusermeal.gender,
                total_tdee: updateusermeal.total_tdee,
                mealplan1: updateusermeal.mealplan1,
                mealplan2: updateusermeal.mealplan2
                  ? updateusermeal.mealplan2
                  : 0,
                mealplantype: 1,
                mealwaterdata: cups,
                total_cups_count: cups,
                usergoal: updateusermeal.goal,
                meal10: meal10,
                meal11: meal11,
                meal12: meal12,
                meal13: meal13,
                meal20: meal20,
                meal21: meal21,
                meal22: meal22,
                meal23: meal23,
                meal30: meal30,
                meal31: meal31,
                meal32: meal32,
                meal33: meal33,
                meal40: meal40,
                meal41: meal41,
                meal42: meal42,
                meal43: meal43,
                meal50: meal50,
                meal51: meal51,
                meal52: meal52,
                meal53: meal53,
                meal60: meal60,
                meal61: meal61,
                meal62: meal62,
                meal63: meal63,
                updatedAt: new Date(),
              }
              var saveSwapmeal = await query.insert(swapmealcoll, swapmeal)
            }
          }
        }
      } else {
        // FEMALE meal breakdown in 5

        if (
          updateusermeal.mealplan1 != '' &&
          updateusermeal.mealplan2 != '' &&
          updateusermeal.goal == 3
        ) {
          // goal - 3 (two meal plan)
          var usercalories1 = updateusermeal.mealplan1
          var usercalories2 = updateusermeal.mealplan2
          var usercarbs = updateusermeal.body.carbs
          var userprotein = updateusermeal.body.protein
          var userfat = updateusermeal.body.fat
          var mealpercentage = updateusermeal.mealpercentage

          var preparemealplan1 = await UserService.preparemealplan1v2(
            usercalories1,
            usercarbs,
            userprotein,
            userfat,
            mealpercentage
          )
          var preparemealplan2 = await UserService.preparemealplan1v2(
            usercalories2,
            usercarbs,
            userprotein,
            userfat,
            mealpercentage
          )

          var userdiet = updateusermeal.diettype
          let filter
          if (userdiet == 1) {
            filter = { paleo: { $ne: 'FALSE' } }
          } else if (userdiet == 2) {
            filter = { mediterranean: { $ne: 'FALSE' } }
          } else if (userdiet == 3) {
            filter = { pescatarian: { $ne: 'FALSE' } }
          } else if (userdiet == 4) {
            filter = { vegan: { $ne: 'FALSE' } }
          } else {
            filter = {}
          }
          let dietfilter
          var finalarrplan1 = []
          var finalarrplan2 = []
          var result = []
          var arrplan1 = preparemealplan1
          var arrplan2 = preparemealplan2

          for (let i = 0; i < arrplan1.length; i++) {
            let checkmeal = 'meal' + [i + 1]
            var dynObj = {}
            dynObj[checkmeal] = 'TRUE'

            dietfilter = { $and: [filter, dynObj] }
            //  console.log(arrplan1[i].cal);
            // console.log("dietfilter",dietfilter);
            var category = [
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
            ]

            var mealVal = {
              cal: arrplan1[i].cal,
              carb: arrplan1[i].carb,
              protein: arrplan1[i].protein,
              fat: arrplan1[i].fat,
            }

            var meal = await UserService.getmeal(
              dietfilter,
              mealVal,
              category[i]
            )
            var finalmeal = meal
            var caloriesfood = finalmeal[0].calories._id
            var carbfood = finalmeal[1].carbs._id
            var protinfood = finalmeal[2].proteins._id
            var fatsfood = finalmeal[3].fats._id
            if (checkmeal == 'meal1') {
              var meal1_10 = caloriesfood
              var meal1_11 = carbfood
              var meal1_12 = protinfood
              var meal1_13 = fatsfood
            }
            if (checkmeal == 'meal2') {
              var meal1_20 = caloriesfood
              var meal1_21 = carbfood
              var meal1_22 = protinfood
              var meal1_23 = fatsfood
            }
            if (checkmeal == 'meal3') {
              var meal1_30 = caloriesfood
              var meal1_31 = carbfood
              var meal1_32 = protinfood
              var meal1_33 = fatsfood
            }
            if (checkmeal == 'meal4') {
              var meal1_40 = caloriesfood
              var meal1_41 = carbfood
              var meal1_42 = protinfood
              var meal1_43 = fatsfood
            }
            if (checkmeal == 'meal5') {
              var meal1_50 = caloriesfood
              var meal1_51 = carbfood
              var meal1_52 = protinfood
              var meal1_53 = fatsfood
            }
            if (checkmeal == 'meal6') {
              var meal1_60 = caloriesfood
              var meal1_61 = carbfood
              var meal1_62 = protinfood
              var meal1_63 = fatsfood
            }
            finalarrplan1.push(finalmeal)
          }

          for (let i = 0; i < arrplan2.length; i++) {
            let checkmeal = 'meal' + [i + 1]
            var dynObj = {}
            dynObj[checkmeal] = 'TRUE'

            dietfilter = { $and: [filter, dynObj] }

            var category = [
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
            ]

            var mealVal = {
              cal: arrplan2[i].cal,
              carb: arrplan2[i].carb,
              protein: arrplan2[i].protein,
              fat: arrplan2[i].fat,
            }

            var meal = await UserService.getmeal(
              dietfilter,
              mealVal,
              category[i]
            )
            var finalmeal = meal
            var caloriesfood = finalmeal[0].calories._id
            var carbfood = finalmeal[1].carbs._id
            var protinfood = finalmeal[2].proteins._id
            var fatsfood = finalmeal[3].fats._id
            if (checkmeal == 'meal1') {
              var meal2_10 = [caloriesfood]
              var meal2_11 = [carbfood]
              var meal2_12 = [protinfood]
              var meal2_13 = [fatsfood]
            }
            if (checkmeal == 'meal2') {
              var meal2_20 = [caloriesfood]
              var meal2_21 = [carbfood]
              var meal2_22 = [protinfood]
              var meal2_23 = [fatsfood]
            }
            if (checkmeal == 'meal3') {
              var meal2_30 = [caloriesfood]
              var meal2_31 = [carbfood]
              var meal2_32 = [protinfood]
              var meal2_33 = [fatsfood]
            }
            if (checkmeal == 'meal4') {
              var meal2_40 = [caloriesfood]
              var meal2_41 = [carbfood]
              var meal2_42 = [protinfood]
              var meal2_43 = [fatsfood]
            }
            if (checkmeal == 'meal5') {
              var meal2_50 = [caloriesfood]
              var meal2_51 = [carbfood]
              var meal2_52 = [protinfood]
              var meal2_53 = [fatsfood]
            }
            if (checkmeal == 'meal6') {
              var meal2_60 = [caloriesfood]
              var meal2_61 = [carbfood]
              var meal2_62 = [protinfood]
              var meal2_63 = [fatsfood]
            }
            finalarrplan2.push(finalmeal)
          }

          // console.log("final---1--",finalarrplan1);
          // console.log("final---2--",finalarrplan2);

          for (let i = 0; i < 3; i++) {
            if (planDate != '') {
              dateofplan = new Date(
                new Date(moment(planDate).add(i, 'days')).setUTCHours(
                  0,
                  0,
                  0,
                  0
                )
              )
            } else {
              dateofplan = new Date(
                new Date(moment(new Date()).add(i, 'days')).setUTCHours(
                  0,
                  0,
                  0,
                  0
                )
              )
            }
            var genmeal = {
              mealplan: finalarrplan1,
              user_id: req.authenticationUser.authId,
              mealplandate: dateofplan,
              bodytype: updateusermeal.body.bodytype,
              carbs: updateusermeal.body.carbs,
              protein: updateusermeal.body.protein,
              fat: updateusermeal.body.fat,
              workouttype: updateusermeal.workout.workouttype,
              workpercentage: updateusermeal.workout.workpercentage,
              leveltype: updateusermeal.level.leveltype,
              levelpercentage: updateusermeal.level.levelpercentage,
              weight: updateusermeal.weight,
              bodyfat: updateusermeal.bodyfat,
              bmr: updateusermeal.bmr,
              diettype: updateusermeal.diettype,
              mealpercentage: updateusermeal.mealpercentage,
              usertype: updateusermeal.gender,
              total_tdee: updateusermeal.total_tdee,
              mealplan1: updateusermeal.mealplan1,
              mealplan2: updateusermeal.mealplan2
                ? updateusermeal.mealplan2
                : 0,
              mealplantype: 1,
              mealwaterdata: cups,
              total_cups_count: cups,
              usergoal: updateusermeal.goal,
              updatedAt: new Date(),
            }
            var checkmeal = await query.findOne(usermealcoll, {
              $and: [
                { user_id: req.authenticationUser.authId },
                { mealplandate: dateofplan },
              ],
            })
            if (checkmeal) {
              // update
              var storemeal = await query.findOneAndUpdate(
                usermealcoll,
                { _id: checkmeal._id },
                { $set: genmeal }
              )
              var swapmeal = {
                user_id: req.authenticationUser.authId,
                mealplandate: dateofplan,
                bodytype: updateusermeal.body.bodytype,
                carbs: updateusermeal.body.carbs,
                protein: updateusermeal.body.protein,
                fat: updateusermeal.body.fat,
                workouttype: updateusermeal.workout.workouttype,
                workpercentage: updateusermeal.workout.workpercentage,
                leveltype: updateusermeal.level.leveltype,
                levelpercentage: updateusermeal.level.levelpercentage,
                weight: updateusermeal.weight,
                bodyfat: updateusermeal.bodyfat,
                bmr: updateusermeal.bmr,
                diettype: updateusermeal.diettype,
                usertype: updateusermeal.gender,
                total_tdee: updateusermeal.total_tdee,
                mealplan1: updateusermeal.mealplan1,
                mealplan2: updateusermeal.mealplan2
                  ? updateusermeal.mealplan2
                  : 0,
                mealplantype: 1,
                mealwaterdata: cups,
                total_cups_count: cups,
                usergoal: updateusermeal.goal,
                meal10: meal1_10,
                meal11: meal1_11,
                meal12: meal1_12,
                meal13: meal1_13,
                meal20: meal1_20,
                meal21: meal1_21,
                meal22: meal1_22,
                meal23: meal1_23,
                meal30: meal1_30,
                meal31: meal1_31,
                meal32: meal1_32,
                meal33: meal1_33,
                meal40: meal1_40,
                meal41: meal1_41,
                meal42: meal1_42,
                meal43: meal1_43,
                meal50: meal1_50,
                meal51: meal1_51,
                meal52: meal1_52,
                meal53: meal1_53,
                // meal60 : meal1_60,
                // meal61 : meal1_61,
                // meal62 : meal1_62,
                // meal63 : meal1_63,
                updatedAt: new Date(),
              }
              var updateswapmeal = await query.findOneAndUpdate(
                swapmealcoll,
                { usermeal_id: checkmeal._id },
                { $set: swapmeal }
              )
            } else {
              var storemeal = await query.insert(usermealcoll, genmeal)
              if (storemeal) {
                var usermeal_id = storemeal._id
                var swapmeal = {
                  usermeal_id: usermeal_id,
                  user_id: req.authenticationUser.authId,
                  mealplandate: dateofplan,
                  bodytype: updateusermeal.body.bodytype,
                  carbs: updateusermeal.body.carbs,
                  protein: updateusermeal.body.protein,
                  fat: updateusermeal.body.fat,
                  workouttype: updateusermeal.workout.workouttype,
                  workpercentage: updateusermeal.workout.workpercentage,
                  leveltype: updateusermeal.level.leveltype,
                  levelpercentage: updateusermeal.level.levelpercentage,
                  weight: updateusermeal.weight,
                  bodyfat: updateusermeal.bodyfat,
                  bmr: updateusermeal.bmr,
                  diettype: updateusermeal.diettype,
                  usertype: updateusermeal.gender,
                  total_tdee: updateusermeal.total_tdee,
                  mealplan1: updateusermeal.mealplan1,
                  mealplan2: updateusermeal.mealplan2
                    ? updateusermeal.mealplan2
                    : 0,
                  mealplantype: 1,
                  mealwaterdata: cups,
                  total_cups_count: cups,
                  usergoal: updateusermeal.goal,
                  meal10: meal1_10,
                  meal11: meal1_11,
                  meal12: meal1_12,
                  meal13: meal1_13,
                  meal20: meal1_20,
                  meal21: meal1_21,
                  meal22: meal1_22,
                  meal23: meal1_23,
                  meal30: meal1_30,
                  meal31: meal1_31,
                  meal32: meal1_32,
                  meal33: meal1_33,
                  meal40: meal1_40,
                  meal41: meal1_41,
                  meal42: meal1_42,
                  meal43: meal1_43,
                  meal50: meal1_50,
                  meal51: meal1_51,
                  meal52: meal1_52,
                  meal53: meal1_53,
                  // meal60 : meal1_60,
                  // meal61 : meal1_61,
                  // meal62 : meal1_62,
                  // meal63 : meal1_63,
                  updatedAt: new Date(),
                }
                var saveSwapmeal = await query.insert(swapmealcoll, swapmeal)
              }
            }
          }

          for (let i = 0; i < 1; i++) {
            if (planDate != '') {
              dateofplan = new Date(
                new Date(moment(planDate).add(3, 'days')).setUTCHours(
                  0,
                  0,
                  0,
                  0
                )
              )
            } else {
              dateofplan = new Date(
                new Date(moment(new Date()).add(3, 'days')).setUTCHours(
                  0,
                  0,
                  0,
                  0
                )
              )
            }
            var genmeal = {
              mealplan: finalarrplan2,
              user_id: req.authenticationUser.authId,
              mealplandate: dateofplan,
              bodytype: updateusermeal.body.bodytype,
              carbs: updateusermeal.body.carbs,
              protein: updateusermeal.body.protein,
              fat: updateusermeal.body.fat,
              workouttype: updateusermeal.workout.workouttype,
              workpercentage: updateusermeal.workout.workpercentage,
              leveltype: updateusermeal.level.leveltype,
              levelpercentage: updateusermeal.level.levelpercentage,
              weight: updateusermeal.weight,
              bodyfat: updateusermeal.bodyfat,
              bmr: updateusermeal.bmr,
              diettype: updateusermeal.diettype,
              mealpercentage: updateusermeal.mealpercentage,
              usertype: updateusermeal.gender,
              total_tdee: updateusermeal.total_tdee,
              mealplan1: updateusermeal.mealplan1,
              mealplan2: updateusermeal.mealplan2
                ? updateusermeal.mealplan2
                : 0,
              mealplantype: 2,
              mealwaterdata: cups,
              total_cups_count: cups,
              usergoal: updateusermeal.goal,
              updatedAt: new Date(),
            }
            var checkmeal = await query.findOne(usermealcoll, {
              $and: [
                { user_id: req.authenticationUser.authId },
                { mealplandate: dateofplan },
              ],
            })
            if (checkmeal) {
              // update
              var storemeal = await query.findOneAndUpdate(
                usermealcoll,
                { _id: checkmeal._id },
                { $set: genmeal }
              )
              var swapmeal = {
                user_id: req.authenticationUser.authId,
                mealplandate: dateofplan,
                bodytype: updateusermeal.body.bodytype,
                carbs: updateusermeal.body.carbs,
                protein: updateusermeal.body.protein,
                fat: updateusermeal.body.fat,
                workouttype: updateusermeal.workout.workouttype,
                workpercentage: updateusermeal.workout.workpercentage,
                leveltype: updateusermeal.level.leveltype,
                levelpercentage: updateusermeal.level.levelpercentage,
                weight: updateusermeal.weight,
                bodyfat: updateusermeal.bodyfat,
                bmr: updateusermeal.bmr,
                diettype: updateusermeal.diettype,
                usertype: updateusermeal.gender,
                total_tdee: updateusermeal.total_tdee,
                mealplan1: updateusermeal.mealplan1,
                mealplan2: updateusermeal.mealplan2
                  ? updateusermeal.mealplan2
                  : 0,
                mealplantype: 1,
                mealwaterdata: cups,
                total_cups_count: cups,
                usergoal: updateusermeal.goal,
                meal10: meal2_10,
                meal11: meal2_11,
                meal12: meal2_12,
                meal13: meal2_13,
                meal20: meal2_20,
                meal21: meal2_21,
                meal22: meal2_22,
                meal23: meal2_23,
                meal30: meal2_30,
                meal31: meal2_31,
                meal32: meal2_32,
                meal33: meal2_33,
                meal40: meal2_40,
                meal41: meal2_41,
                meal42: meal2_42,
                meal43: meal2_43,
                meal50: meal2_50,
                meal51: meal2_51,
                meal52: meal2_52,
                meal53: meal2_53,
                // meal60 : meal2_60,
                // meal61 : meal2_61,
                // meal62 : meal2_62,
                // meal63 : meal2_63,
                updatedAt: new Date(),
              }
              var updateswapmeal = await query.findOneAndUpdate(
                swapmealcoll,
                { usermeal_id: checkmeal._id },
                { $set: swapmeal }
              )
            } else {
              var storemeal = await query.insert(usermealcoll, genmeal)
              if (storemeal) {
                var usermeal_id = storemeal._id
                var swapmeal = {
                  usermeal_id: usermeal_id,
                  user_id: req.authenticationUser.authId,
                  mealplandate: dateofplan,
                  bodytype: updateusermeal.body.bodytype,
                  carbs: updateusermeal.body.carbs,
                  protein: updateusermeal.body.protein,
                  fat: updateusermeal.body.fat,
                  workouttype: updateusermeal.workout.workouttype,
                  workpercentage: updateusermeal.workout.workpercentage,
                  leveltype: updateusermeal.level.leveltype,
                  levelpercentage: updateusermeal.level.levelpercentage,
                  weight: updateusermeal.weight,
                  bodyfat: updateusermeal.bodyfat,
                  bmr: updateusermeal.bmr,
                  diettype: updateusermeal.diettype,
                  usertype: updateusermeal.gender,
                  total_tdee: updateusermeal.total_tdee,
                  mealplan1: updateusermeal.mealplan1,
                  mealplan2: updateusermeal.mealplan2
                    ? updateusermeal.mealplan2
                    : 0,
                  mealplantype: 1,
                  mealwaterdata: cups,
                  total_cups_count: cups,
                  usergoal: updateusermeal.goal,
                  meal10: meal2_10,
                  meal11: meal2_11,
                  meal12: meal2_12,
                  meal13: meal2_13,
                  meal20: meal2_20,
                  meal21: meal2_21,
                  meal22: meal2_22,
                  meal23: meal2_23,
                  meal30: meal2_30,
                  meal31: meal2_31,
                  meal32: meal2_32,
                  meal33: meal2_33,
                  meal40: meal2_40,
                  meal41: meal2_41,
                  meal42: meal2_42,
                  meal43: meal2_43,
                  meal50: meal2_50,
                  meal51: meal2_51,
                  meal52: meal2_52,
                  meal53: meal2_53,
                  // meal60 : meal2_60,
                  // meal61 : meal2_61,
                  // meal62 : meal2_62,
                  // meal63 : meal2_63,
                  updatedAt: new Date(),
                }
                var saveSwapmeal = await query.insert(swapmealcoll, swapmeal)
              }
            }
          }
        } else if (updateusermeal.mealplan1 != '' && updateusermeal.goal == 2) {
          // goal plan 2 (1 day meal)
          var usercalories1 = updateusermeal.mealplan1
          var usercarbs = updateusermeal.body.carbs
          var userprotein = updateusermeal.body.protein
          var userfat = updateusermeal.body.fat
          var mealpercentage = updateusermeal.mealpercentage

          var preparemealplan1 = await UserService.preparemealplan1v2(
            usercalories1,
            usercarbs,
            userprotein,
            userfat,
            mealpercentage
          )
          console.log(preparemealplan1)
          var userdiet = updateusermeal.diettype
          let filter
          if (userdiet == 1) {
            filter = { paleo: { $ne: 'FALSE' } }
          } else if (userdiet == 2) {
            filter = { mediterranean: { $ne: 'FALSE' } }
          } else if (userdiet == 3) {
            filter = { pescatarian: { $ne: 'FALSE' } }
          } else if (userdiet == 4) {
            filter = { vegan: { $ne: 'FALSE' } }
          } else {
            filter = {}
          }

          let dietfilter
          var finalarrplan1 = []
          var result = []
          const arrplan1 = preparemealplan1

          for (let i = 0; i < arrplan1.length; i++) {
            let checkmeal = 'meal' + [i + 1]
            var dynObj = {}
            dynObj[checkmeal] = 'TRUE'

            dietfilter = { $and: [filter, dynObj] }
            //  console.log(arrplan1[i].cal);
            // console.log("dietfilter",dietfilter);
            var category = [
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
            ]

            var mealVal = {
              cal: arrplan1[i].cal,
              carb: arrplan1[i].carb,
              protein: arrplan1[i].protein,
              fat: arrplan1[i].fat,
            }

            var meal = await UserService.getmeal(
              dietfilter,
              mealVal,
              category[i]
            )
            var finalmeal = meal
            var caloriesfood = finalmeal[0].calories._id
            var carbfood = finalmeal[1].carbs._id
            var protinfood = finalmeal[2].proteins._id
            var fatsfood = finalmeal[3].fats._id
            if (checkmeal == 'meal1') {
              var meal10 = caloriesfood
              var meal11 = carbfood
              var meal12 = protinfood
              var meal13 = fatsfood
            }
            if (checkmeal == 'meal2') {
              var meal20 = caloriesfood
              var meal21 = carbfood
              var meal22 = protinfood
              var meal23 = fatsfood
            }
            if (checkmeal == 'meal3') {
              var meal30 = caloriesfood
              var meal31 = carbfood
              var meal32 = protinfood
              var meal33 = fatsfood
            }
            if (checkmeal == 'meal4') {
              var meal40 = caloriesfood
              var meal41 = carbfood
              var meal42 = protinfood
              var meal43 = fatsfood
            }
            if (checkmeal == 'meal5') {
              var meal50 = caloriesfood
              var meal51 = carbfood
              var meal52 = protinfood
              var meal53 = fatsfood
            }
            if (checkmeal == 'meal6') {
              var meal60 = caloriesfood
              var meal61 = carbfood
              var meal62 = protinfood
              var meal63 = fatsfood
            }
            finalarrplan1.push(finalmeal)
          }

          // console.log("final---1--",finalarrplan1);
          if (planDate != '') {
            dateofplan = new Date(
              new Date(moment(planDate).add(0, 'days')).setUTCHours(0, 0, 0, 0)
            )
          } else {
            dateofplan = new Date(
              new Date(moment(new Date()).add(0, 'days')).setUTCHours(
                0,
                0,
                0,
                0
              )
            )
          }
          var genmeal = {
            mealplan: finalarrplan1,
            user_id: req.authenticationUser.authId,
            mealplandate: dateofplan,
            bodytype: updateusermeal.body.bodytype,
            carbs: updateusermeal.body.carbs,
            protein: updateusermeal.body.protein,
            fat: updateusermeal.body.fat,
            workouttype: updateusermeal.workout.workouttype,
            workpercentage: updateusermeal.workout.workpercentage,
            leveltype: updateusermeal.level.leveltype,
            levelpercentage: updateusermeal.level.levelpercentage,
            weight: updateusermeal.weight,
            bodyfat: updateusermeal.bodyfat,
            bmr: updateusermeal.bmr,
            diettype: updateusermeal.diettype,
            mealpercentage: updateusermeal.mealpercentage,
            usertype: updateusermeal.gender,
            total_tdee: updateusermeal.total_tdee,
            mealplan1: updateusermeal.mealplan1,
            mealplan2: updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
            mealplantype: 1,
            mealwaterdata: cups,
            total_cups_count: cups,
            usergoal: updateusermeal.goal,
            updatedAt: new Date(),
          }
          var checkmeal = await query.findOne(usermealcoll, {
            $and: [
              { user_id: req.authenticationUser.authId },
              { mealplandate: dateofplan },
            ],
          })
          if (checkmeal) {
            // update
            var storemeal = await query.findOneAndUpdate(
              usermealcoll,
              { _id: checkmeal._id },
              { $set: genmeal }
            )
            var swapmeal = {
              user_id: req.authenticationUser.authId,
              mealplandate: dateofplan,
              bodytype: updateusermeal.body.bodytype,
              carbs: updateusermeal.body.carbs,
              protein: updateusermeal.body.protein,
              fat: updateusermeal.body.fat,
              workouttype: updateusermeal.workout.workouttype,
              workpercentage: updateusermeal.workout.workpercentage,
              leveltype: updateusermeal.level.leveltype,
              levelpercentage: updateusermeal.level.levelpercentage,
              weight: updateusermeal.weight,
              bodyfat: updateusermeal.bodyfat,
              bmr: updateusermeal.bmr,
              diettype: updateusermeal.diettype,
              usertype: updateusermeal.gender,
              total_tdee: updateusermeal.total_tdee,
              mealplan1: updateusermeal.mealplan1,
              mealplan2: updateusermeal.mealplan2
                ? updateusermeal.mealplan2
                : 0,
              mealplantype: 1,
              mealwaterdata: cups,
              total_cups_count: cups,
              usergoal: updateusermeal.goal,
              meal10: meal10,
              meal11: meal11,
              meal12: meal12,
              meal13: meal13,
              meal20: meal20,
              meal21: meal21,
              meal22: meal22,
              meal23: meal23,
              meal30: meal30,
              meal31: meal31,
              meal32: meal32,
              meal33: meal33,
              meal40: meal40,
              meal41: meal41,
              meal42: meal42,
              meal43: meal43,
              meal50: meal50,
              meal51: meal51,
              meal52: meal52,
              meal53: meal53,
              // meal60 : meal60,
              // meal61 : meal61,
              // meal62 : meal62,
              // meal63 : meal63,
              updatedAt: new Date(),
            }
            var updateswapmeal = await query.findOneAndUpdate(
              swapmealcoll,
              { usermeal_id: checkmeal._id },
              { $set: swapmeal }
            )
          } else {
            var storemeal = await query.insert(usermealcoll, genmeal)
            if (storemeal) {
              var usermeal_id = storemeal._id
              var swapmeal = {
                usermeal_id: usermeal_id,
                user_id: req.authenticationUser.authId,
                mealplandate: dateofplan,
                bodytype: updateusermeal.body.bodytype,
                carbs: updateusermeal.body.carbs,
                protein: updateusermeal.body.protein,
                fat: updateusermeal.body.fat,
                workouttype: updateusermeal.workout.workouttype,
                workpercentage: updateusermeal.workout.workpercentage,
                leveltype: updateusermeal.level.leveltype,
                levelpercentage: updateusermeal.level.levelpercentage,
                weight: updateusermeal.weight,
                bodyfat: updateusermeal.bodyfat,
                bmr: updateusermeal.bmr,
                diettype: updateusermeal.diettype,
                usertype: updateusermeal.gender,
                total_tdee: updateusermeal.total_tdee,
                mealplan1: updateusermeal.mealplan1,
                mealplan2: updateusermeal.mealplan2
                  ? updateusermeal.mealplan2
                  : 0,
                mealplantype: 1,
                mealwaterdata: cups,
                total_cups_count: cups,
                usergoal: updateusermeal.goal,
                meal10: meal10,
                meal11: meal11,
                meal12: meal12,
                meal13: meal13,
                meal20: meal20,
                meal21: meal21,
                meal22: meal22,
                meal23: meal23,
                meal30: meal30,
                meal31: meal31,
                meal32: meal32,
                meal33: meal33,
                meal40: meal40,
                meal41: meal41,
                meal42: meal42,
                meal43: meal43,
                meal50: meal50,
                meal51: meal51,
                meal52: meal52,
                meal53: meal53,
                // meal60 : meal60,
                // meal61 : meal61,
                // meal62 : meal62,
                // meal63 : meal63,
                updatedAt: new Date(),
              }
              var saveSwapmeal = await query.insert(swapmealcoll, swapmeal)
            }
          }
        } else {
          // goal 3 (1 day meal )
          var usercalories1 = updateusermeal.mealplan1
          var usercarbs = updateusermeal.body.carbs
          var userprotein = updateusermeal.body.protein
          var userfat = updateusermeal.body.fat
          var mealpercentage = updateusermeal.mealpercentage

          var preparemealplan1 = await UserService.preparemealplan1v2(
            usercalories1,
            usercarbs,
            userprotein,
            userfat,
            mealpercentage
          )
          console.log(preparemealplan1)
          var userdiet = updateusermeal.diettype
          let filter
          if (userdiet == 1) {
            filter = { paleo: { $ne: 'FALSE' } }
          } else if (userdiet == 2) {
            filter = { mediterranean: { $ne: 'FALSE' } }
          } else if (userdiet == 3) {
            filter = { pescatarian: { $ne: 'FALSE' } }
          } else if (userdiet == 4) {
            filter = { vegan: { $ne: 'FALSE' } }
          } else {
            filter = {}
          }
          let dietfilter
          var finalarrplan1 = []
          var result = []
          const arrplan1 = preparemealplan1

          for (let i = 0; i < arrplan1.length; i++) {
            let checkmeal = 'meal' + [i + 1]
            var dynObj = {}
            dynObj[checkmeal] = 'TRUE'

            dietfilter = { $and: [filter, dynObj] }
            //  console.log(arrplan1[i].cal);
            // console.log("dietfilter",dietfilter);
            var category = [
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'Carb, Fruit' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
              { 0: 'Protein', 1: 'Carb', 2: 'Fats', 3: 'F-Carb' },
            ]

            var mealVal = {
              cal: arrplan1[i].cal,
              carb: arrplan1[i].carb,
              protein: arrplan1[i].protein,
              fat: arrplan1[i].fat,
            }

            var meal = await UserService.getmeal(
              dietfilter,
              mealVal,
              category[i]
            )
            var finalmeal = meal
            var caloriesfood = finalmeal[0].calories._id
            var carbfood = finalmeal[1].carbs._id
            var protinfood = finalmeal[2].proteins._id
            var fatsfood = finalmeal[3].fats._id
            if (checkmeal == 'meal1') {
              var meal10 = caloriesfood
              var meal11 = carbfood
              var meal12 = protinfood
              var meal13 = fatsfood
            }
            if (checkmeal == 'meal2') {
              var meal20 = caloriesfood
              var meal21 = carbfood
              var meal22 = protinfood
              var meal23 = fatsfood
            }
            if (checkmeal == 'meal3') {
              var meal30 = caloriesfood
              var meal31 = carbfood
              var meal32 = protinfood
              var meal33 = fatsfood
            }
            if (checkmeal == 'meal4') {
              var meal40 = caloriesfood
              var meal41 = carbfood
              var meal42 = protinfood
              var meal43 = fatsfood
            }
            if (checkmeal == 'meal5') {
              var meal50 = caloriesfood
              var meal51 = carbfood
              var meal52 = protinfood
              var meal53 = fatsfood
            }
            if (checkmeal == 'meal6') {
              var meal60 = caloriesfood
              var meal61 = carbfood
              var meal62 = protinfood
              var meal63 = fatsfood
            }
            finalarrplan1.push(finalmeal)
          }

          // console.log("final---1--",finalarrplan1);
          if (planDate != '') {
            dateofplan = new Date(
              new Date(moment(planDate).add(0, 'days')).setUTCHours(0, 0, 0, 0)
            )
          } else {
            dateofplan = new Date(
              new Date(moment(new Date()).add(0, 'days')).setUTCHours(
                0,
                0,
                0,
                0
              )
            )
          }
          var genmeal = {
            mealplan: finalarrplan1,
            user_id: req.authenticationUser.authId,
            mealplandate: dateofplan,
            bodytype: updateusermeal.body.bodytype,
            carbs: updateusermeal.body.carbs,
            protein: updateusermeal.body.protein,
            fat: updateusermeal.body.fat,
            workouttype: updateusermeal.workout.workouttype,
            workpercentage: updateusermeal.workout.workpercentage,
            leveltype: updateusermeal.level.leveltype,
            levelpercentage: updateusermeal.level.levelpercentage,
            weight: updateusermeal.weight,
            bodyfat: updateusermeal.bodyfat,
            bmr: updateusermeal.bmr,
            diettype: updateusermeal.diettype,
            mealpercentage: updateusermeal.mealpercentage,
            usertype: updateusermeal.gender,
            total_tdee: updateusermeal.total_tdee,
            mealplan1: updateusermeal.mealplan1,
            mealplan2: updateusermeal.mealplan2 ? updateusermeal.mealplan2 : 0,
            mealplantype: 1,
            mealwaterdata: cups,
            total_cups_count: cups,
            usergoal: updateusermeal.goal,
            updatedAt: new Date(),
          }
          var checkmeal = await query.findOne(usermealcoll, {
            $and: [
              { user_id: req.authenticationUser.authId },
              { mealplandate: dateofplan },
            ],
          })
          if (checkmeal) {
            // update
            var storemeal = await query.findOneAndUpdate(
              usermealcoll,
              { _id: checkmeal._id },
              { $set: genmeal }
            )
            var swapmeal = {
              user_id: req.authenticationUser.authId,
              mealplandate: dateofplan,
              bodytype: updateusermeal.body.bodytype,
              carbs: updateusermeal.body.carbs,
              protein: updateusermeal.body.protein,
              fat: updateusermeal.body.fat,
              workouttype: updateusermeal.workout.workouttype,
              workpercentage: updateusermeal.workout.workpercentage,
              leveltype: updateusermeal.level.leveltype,
              levelpercentage: updateusermeal.level.levelpercentage,
              weight: updateusermeal.weight,
              bodyfat: updateusermeal.bodyfat,
              bmr: updateusermeal.bmr,
              diettype: updateusermeal.diettype,
              usertype: updateusermeal.gender,
              total_tdee: updateusermeal.total_tdee,
              mealplan1: updateusermeal.mealplan1,
              mealplan2: updateusermeal.mealplan2
                ? updateusermeal.mealplan2
                : 0,
              mealplantype: 1,
              mealwaterdata: cups,
              total_cups_count: cups,
              usergoal: updateusermeal.goal,
              meal10: meal10,
              meal11: meal11,
              meal12: meal12,
              meal13: meal13,
              meal20: meal20,
              meal21: meal21,
              meal22: meal22,
              meal23: meal23,
              meal30: meal30,
              meal31: meal31,
              meal32: meal32,
              meal33: meal33,
              meal40: meal40,
              meal41: meal41,
              meal42: meal42,
              meal43: meal43,
              meal50: meal50,
              meal51: meal51,
              meal52: meal52,
              meal53: meal53,
              // meal60 : meal60,
              // meal61 : meal61,
              // meal62 : meal62,
              // meal63 : meal63,
              updatedAt: new Date(),
            }
            var updateswapmeal = await query.findOneAndUpdate(
              swapmealcoll,
              { usermeal_id: checkmeal._id },
              { $set: swapmeal }
            )
          } else {
            var storemeal = await query.insert(usermealcoll, genmeal)
            if (storemeal) {
              var usermeal_id = storemeal._id
              var swapmeal = {
                usermeal_id: usermeal_id,
                user_id: req.authenticationUser.authId,
                mealplandate: dateofplan,
                bodytype: updateusermeal.body.bodytype,
                carbs: updateusermeal.body.carbs,
                protein: updateusermeal.body.protein,
                fat: updateusermeal.body.fat,
                workouttype: updateusermeal.workout.workouttype,
                workpercentage: updateusermeal.workout.workpercentage,
                leveltype: updateusermeal.level.leveltype,
                levelpercentage: updateusermeal.level.levelpercentage,
                weight: updateusermeal.weight,
                bodyfat: updateusermeal.bodyfat,
                bmr: updateusermeal.bmr,
                diettype: updateusermeal.diettype,
                usertype: updateusermeal.gender,
                total_tdee: updateusermeal.total_tdee,
                mealplan1: updateusermeal.mealplan1,
                mealplan2: updateusermeal.mealplan2
                  ? updateusermeal.mealplan2
                  : 0,
                mealplantype: 1,
                mealwaterdata: cups,
                total_cups_count: cups,
                usergoal: updateusermeal.goal,
                meal10: meal10,
                meal11: meal11,
                meal12: meal12,
                meal13: meal13,
                meal20: meal20,
                meal21: meal21,
                meal22: meal22,
                meal23: meal23,
                meal30: meal30,
                meal31: meal31,
                meal32: meal32,
                meal33: meal33,
                meal40: meal40,
                meal41: meal41,
                meal42: meal42,
                meal43: meal43,
                meal50: meal50,
                meal51: meal51,
                meal52: meal52,
                meal53: meal53,
                // meal60 : meal60,
                // meal61 : meal61,
                // meal62 : meal62,
                // meal63 : meal63,
                updatedAt: new Date(),
              }
              var saveSwapmeal = await query.insert(swapmealcoll, swapmeal)
            }
          }
        }
      }

      return responseModel.successResponse('User meal generated successfully.')
    } else {
      return responseModel.failResponse('Error while genrating meal')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while genrating meal: ' + errMessage
    )
  }
}

exports.updateWaterIntake = async function (req) {
  try {
    var water_intake_glass = req.body.water_intake_glass
    var usermealId = req.body.usermealId
    var getWaterData = await query.findOne(usermealcoll, {
      $and: [{ user_id: req.authenticationUser.authId }, { _id: usermealId }],
    })

    if (getWaterData) {
      var mealwaterdata = getWaterData.mealwaterdata
      if (mealwaterdata == 0) {
        return responseModel.failResponse(
          'There is no meal water intake glass left.'
        )
      }
      var finalMealWaterData = mealwaterdata - water_intake_glass
      //console.log("finalMealWaterData",finalMealWaterData);
      var data = {
        mealwaterdata: finalMealWaterData,
        updatedAt: Date.now(),
      }
      let user = await query.findOneAndUpdate(
        usermealcoll,
        { _id: usermealId },
        { $set: data }
      )
      return responseModel.successResponse(
        'User meal water intake glass updated successfully',
        finalMealWaterData
      )
    } else {
      return responseModel.failResponse('No meal plan found')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user meal water intake glass: ' + errMessage
    )
  }
}

exports.getUserMealPlan = async function (req) {
  try {
    var Date = req.body.pickedDate
    console.log(Date)
    console.log(req.body.pickedDate)
    var user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })

    var userdiettype = user.diettype
    var getmeal = await query.findOne(usermealcoll, {
      $and: [
        { user_id: req.authenticationUser.authId },
        { mealplandate: Date },
      ],
    })
    console.log('getmeal')

    if (getmeal) {
      //eaten call data
      for (let i = 0; i < getmeal.mealplan.length; i++) {
        console.log('hello')
        console.log(getmeal.mealplan[i].calories)
        for (let j = 0; j < getmeal.mealplan[i].length; j++) {
          console.log('hello')
          console.log(getmeal.mealplan[i][j])
        }
      }
      var calEaten = await query.findOne(caloriescoll, {
        $and: [
          { user_id: req.authenticationUser.authId },
          { mealplandate: req.body.pickedDate },
          { mealId: getmeal._id },
        ],
      })
      var calEatenData = JSON.parse(JSON.stringify(calEaten))

      //exercise + apple watch data
      var checkUserExerciseCal = await userexercisecoll.find({
        userId: req.authenticationUser.authId,
        date: req.body.pickedDate,
      })

      let watchCalData = await applewatchdata.find({
        userId: req.authenticationUser.authId,
        date: req.body.pickedDate,
      })

      var totalUserExerciseCal = 0
      let userWatchCal = 0
      let totalBurnedCal = 0

      if (checkUserExerciseCal.length > 0) {
        for (i = 0; i < checkUserExerciseCal.length; i++) {
          console.log(checkUserExerciseCal[i].calories)
          totalUserExerciseCal += checkUserExerciseCal[i].calories
        }
      } else {
        totalUserExerciseCal = 0
      }
      if (watchCalData.length > 0) {
        userWatchCal = watchCalData[0].calories
      } else {
        userWatchCal = 0
      }

      totalBurnedCal = totalUserExerciseCal + userWatchCal

      var obj = JSON.parse(JSON.stringify(getmeal))
      // console.log(obj)
      obj.diettype = userdiettype
      obj.plantdetails = user.plantdetails ? user.plantdetails : ''
      obj.isPremium = user.isPremium
      obj.eatenCaloriesData = calEatenData
      obj.totalBurnedCal = totalBurnedCal
      console.log(obj)
      return responseModel.successResponse('User meal get successfully', obj)
    } else {
      return responseModel.successResponse(
        'No meal found, Generate meal first!'
      )
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while getting user meal plan: ' + errMessage
    )
  }
}

exports.swapMealFoodRequest = async function (req) {
  try {
    var usermealId = req.body.usermealId
    var mealno = req.body.mealno
    var foodposition = req.body.foodposition
    var diettype = req.body.diettype
    var foodId
    // var foodId = req.body.foodId;
    var MealFood = await query.findOne(usermealcoll, { _id: usermealId })
    var swapData = await query.findOne(swapmealcoll, {
      usermeal_id: usermealId,
    })
    if (mealno == 1) {
      if (foodposition == 0) {
        foodId = swapData.meal10
      }
      if (foodposition == 1) {
        foodId = swapData.meal11
      }
      if (foodposition == 2) {
        foodId = swapData.meal12
      }
      if (foodposition == 3) {
        foodId = swapData.meal13
      }
    }

    if (mealno == 2) {
      if (foodposition == 0) {
        foodId = swapData.meal20
      }
      if (foodposition == 1) {
        foodId = swapData.meal21
      }
      if (foodposition == 2) {
        foodId = swapData.meal22
      }
      if (foodposition == 3) {
        foodId = swapData.meal23
      }
    }

    if (mealno == 3) {
      if (foodposition == 0) {
        foodId = swapData.meal30
      }
      if (foodposition == 1) {
        foodId = swapData.meal31
      }
      if (foodposition == 2) {
        foodId = swapData.meal32
      }
      if (foodposition == 3) {
        foodId = swapData.meal33
      }
    }

    if (mealno == 4) {
      if (foodposition == 0) {
        foodId = swapData.meal40
      }
      if (foodposition == 1) {
        foodId = swapData.meal41
      }
      if (foodposition == 2) {
        foodId = swapData.meal42
      }
      if (foodposition == 3) {
        foodId = swapData.meal43
      }
    }

    if (mealno == 5) {
      if (foodposition == 0) {
        foodId = swapData.meal50
      }
      if (foodposition == 1) {
        foodId = swapData.meal51
      }
      if (foodposition == 2) {
        foodId = swapData.meal52
      }
      if (foodposition == 3) {
        foodId = swapData.meal53
      }
    }

    if (mealno == 6) {
      if (foodposition == 0) {
        foodId = swapData.meal60
      }
      if (foodposition == 1) {
        foodId = swapData.meal61
      }
      if (foodposition == 2) {
        foodId = swapData.meal62
      }
      if (foodposition == 3) {
        foodId = swapData.meal63
      }
    }

    //console.log("foodid----------",foodId);

    var food = await query.findOne(mealcoll, { _id: foodId })
    if (food) {
      var foodName = food.grocery_list_name
      var foodCategory = food.category
      var foodCal = food.cal
      var foodProt = food.prot
      var foodCarb = food.carbs
      var foodFat = food.fats
      var mealVal
      var mealCat
      var extraFilter = {}
      if (foodCategory == 'Protein') {
        mealVal = foodProt
        mealCat = '$prot'
        extraFilter = {
          cal: { $gte: foodCal },
          carbs: { $gte: foodCarb },
          fats: { $lte: foodFat },
        }
      }
      if (foodCategory == 'Fats') {
        mealVal = foodFat
        mealCat = '$fats'
      }
      if (
        foodCategory == 'Carb' ||
        foodCategory == 'Carb, Fruit' ||
        foodCategory == 'F-Carb'
      ) {
        mealVal = foodCarb
        mealCat = '$carbs'
        extraFilter = {
          cal: { $gte: foodCal },
          carbs: { $gte: foodCarb },
          fats: { $lte: foodFat },
        }
      }

      let filter
      if (diettype == 1) {
        filter = { paleo: { $ne: 'FALSE' } }
      } else if (diettype == 2) {
        filter = { mediterranean: { $ne: 'FALSE' } }
      } else if (diettype == 3) {
        filter = { pescatarian: { $ne: 'FALSE' } }
      } else if (diettype == 4) {
        filter = { vegan: { $ne: 'FALSE' } }
      } else {
        filter = {}
      }

      let dietfilter
      let checkmeal = 'meal' + mealno
      var dynObj = {}
      dynObj[checkmeal] = 'TRUE'
      var idfilter = { _id: { $ne: foodId } }
      var catefilter = { category: foodCategory }
      dietfilter = { $and: [filter, dynObj, idfilter, catefilter] }
      dietfilter.$and.push(extraFilter)
      // console.log("dietfilter",dietfilter);
      // console.log("dietfilter",JSON.stringify(dietfilter));
      // console.log("mealVal",mealVal);
      // console.log("mealCat",mealCat);

      var swapMealArr = await UserService.swapmeal(
        dietfilter,
        mealVal,
        mealCat,
        foodId,
        foodName,
        foodCategory
      )
      swapMealArr.splice(0, 0, food)
      //console.log("swaparr length--",swapMealArr.length);
      if (swapMealArr) {
        return responseModel.successResponse(
          'food swap request list get successfully',
          swapMealArr
        )
      } else {
      }
    } else {
      return responseModel.failResponse('No Food Found!')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while getting food swap list: ' + errMessage
    )
  }
}

exports.swapMealFood = async function (req) {
  try {
    var usermealId = req.body.usermealId
    var foodId = req.body.foodId
    var mealno = req.body.mealno
    var diettype = req.body.diettype
    var foodposition = req.body.foodposition
    var filterCategory
    var MealFood = await query.findOne(usermealcoll, { _id: usermealId })
    var food = await query.findOne(mealcoll, { _id: foodId })
    if (food) {
      var mealname = food.grocery_list_name
      var meal = food
      var foodCategory = food.category
      var foodCal = food.cal
      var foodProt = food.prot
      var foodCarb = food.carbs
      var foodFat = food.fats
      var mealVal
      var mealCat

      // var meal = await UserService.swapmeal(dietfilter, mealVal, mealCat, foodId, foodName, foodCategory);

      if (mealno == 1) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal10 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[0][1].carbs.cal +
            MealFood.mealplan[0][2].proteins.cal +
            MealFood.mealplan[0][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[0][1].carbs.carbs +
            MealFood.mealplan[0][2].proteins.carbs +
            MealFood.mealplan[0][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[0][1].carbs.prot +
            MealFood.mealplan[0][2].proteins.prot +
            MealFood.mealplan[0][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[0][1].carbs.fats +
            MealFood.mealplan[0][2].proteins.fats +
            MealFood.mealplan[0][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[0][0].calories = meal
          MealFood.mealplan[0][4].total.totalCal = totalCal
          MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[0][4].total.totalProt = totalProt
          MealFood.mealplan[0][4].total.totalFats = totalFats
          MealFood.mealplan[0][4].total.CarboPer = CarboPer
          MealFood.mealplan[0][4].total.ProtPer = ProtPer
          MealFood.mealplan[0][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal11 : mealname }});
          var totalCal =
            MealFood.mealplan[0][0].calories.cal +
            meal.cal +
            MealFood.mealplan[0][2].proteins.cal +
            MealFood.mealplan[0][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[0][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[0][2].proteins.carbs +
            MealFood.mealplan[0][3].fats.carbs
          var totalProt =
            MealFood.mealplan[0][0].calories.prot +
            meal.prot +
            MealFood.mealplan[0][2].proteins.prot +
            MealFood.mealplan[0][3].fats.prot
          var totalFats =
            MealFood.mealplan[0][0].calories.fats +
            meal.fats +
            MealFood.mealplan[0][2].proteins.fats +
            MealFood.mealplan[0][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[0][1].carbs = meal
          MealFood.mealplan[0][4].total.totalCal = totalCal
          MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[0][4].total.totalProt = totalProt
          MealFood.mealplan[0][4].total.totalFats = totalFats
          MealFood.mealplan[0][4].total.CarboPer = CarboPer
          MealFood.mealplan[0][4].total.ProtPer = ProtPer
          MealFood.mealplan[0][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal12 : mealname }});
          var totalCal =
            MealFood.mealplan[0][0].calories.cal +
            MealFood.mealplan[0][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[0][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[0][0].calories.carbs +
            MealFood.mealplan[0][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[0][3].fats.carbs
          var totalProt =
            MealFood.mealplan[0][0].calories.prot +
            MealFood.mealplan[0][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[0][3].fats.prot
          var totalFats =
            MealFood.mealplan[0][0].calories.fats +
            MealFood.mealplan[0][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[0][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[0][2].proteins = meal
          MealFood.mealplan[0][4].total.totalCal = totalCal
          MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[0][4].total.totalProt = totalProt
          MealFood.mealplan[0][4].total.totalFats = totalFats
          MealFood.mealplan[0][4].total.CarboPer = CarboPer
          MealFood.mealplan[0][4].total.ProtPer = ProtPer
          MealFood.mealplan[0][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal13 : mealname }});
          var totalCal =
            MealFood.mealplan[0][0].calories.cal +
            MealFood.mealplan[0][1].carbs.cal +
            MealFood.mealplan[0][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[0][0].calories.carbs +
            MealFood.mealplan[0][1].carbs.carbs +
            MealFood.mealplan[0][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[0][0].calories.prot +
            MealFood.mealplan[0][1].carbs.prot +
            MealFood.mealplan[0][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[0][0].calories.fats +
            MealFood.mealplan[0][1].carbs.fats +
            MealFood.mealplan[0][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[0][3].fats = meal
          MealFood.mealplan[0][4].total.totalCal = totalCal
          MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[0][4].total.totalProt = totalProt
          MealFood.mealplan[0][4].total.totalFats = totalFats
          MealFood.mealplan[0][4].total.CarboPer = CarboPer
          MealFood.mealplan[0][4].total.ProtPer = ProtPer
          MealFood.mealplan[0][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 2) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal20 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[1][1].carbs.cal +
            MealFood.mealplan[1][2].proteins.cal +
            MealFood.mealplan[1][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[1][1].carbs.carbs +
            MealFood.mealplan[1][2].proteins.carbs +
            MealFood.mealplan[1][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[1][1].carbs.prot +
            MealFood.mealplan[1][2].proteins.prot +
            MealFood.mealplan[1][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[1][1].carbs.fats +
            MealFood.mealplan[1][2].proteins.fats +
            MealFood.mealplan[1][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[1][0].calories = meal
          MealFood.mealplan[1][4].total.totalCal = totalCal
          MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[1][4].total.totalProt = totalProt
          MealFood.mealplan[1][4].total.totalFats = totalFats
          MealFood.mealplan[1][4].total.CarboPer = CarboPer
          MealFood.mealplan[1][4].total.ProtPer = ProtPer
          MealFood.mealplan[1][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal21 : mealname }});
          var totalCal =
            MealFood.mealplan[1][0].calories.cal +
            meal.cal +
            MealFood.mealplan[1][2].proteins.cal +
            MealFood.mealplan[1][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[1][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[1][2].proteins.carbs +
            MealFood.mealplan[1][3].fats.carbs
          var totalProt =
            MealFood.mealplan[1][0].calories.prot +
            meal.prot +
            MealFood.mealplan[1][2].proteins.prot +
            MealFood.mealplan[1][3].fats.prot
          var totalFats =
            MealFood.mealplan[1][0].calories.fats +
            meal.fats +
            MealFood.mealplan[1][2].proteins.fats +
            MealFood.mealplan[1][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[1][1].carbs = meal
          MealFood.mealplan[1][4].total.totalCal = totalCal
          MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[1][4].total.totalProt = totalProt
          MealFood.mealplan[1][4].total.totalFats = totalFats
          MealFood.mealplan[1][4].total.CarboPer = CarboPer
          MealFood.mealplan[1][4].total.ProtPer = ProtPer
          MealFood.mealplan[1][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal22 : mealname }});
          var totalCal =
            MealFood.mealplan[1][0].calories.cal +
            MealFood.mealplan[1][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[1][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[1][0].calories.carbs +
            MealFood.mealplan[1][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[1][3].fats.carbs
          var totalProt =
            MealFood.mealplan[1][0].calories.prot +
            MealFood.mealplan[1][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[1][3].fats.prot
          var totalFats =
            MealFood.mealplan[1][0].calories.fats +
            MealFood.mealplan[1][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[1][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[1][2].proteins = meal
          MealFood.mealplan[1][4].total.totalCal = totalCal
          MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[1][4].total.totalProt = totalProt
          MealFood.mealplan[1][4].total.totalFats = totalFats
          MealFood.mealplan[1][4].total.CarboPer = CarboPer
          MealFood.mealplan[1][4].total.ProtPer = ProtPer
          MealFood.mealplan[1][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal23 : mealname }});
          var totalCal =
            MealFood.mealplan[1][0].calories.cal +
            MealFood.mealplan[1][1].carbs.cal +
            MealFood.mealplan[1][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[1][0].calories.carbs +
            MealFood.mealplan[1][1].carbs.carbs +
            MealFood.mealplan[1][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[1][0].calories.prot +
            MealFood.mealplan[1][1].carbs.prot +
            MealFood.mealplan[1][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[1][0].calories.fats +
            MealFood.mealplan[1][1].carbs.fats +
            MealFood.mealplan[1][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[1][3].fats = meal
          MealFood.mealplan[1][4].total.totalCal = totalCal
          MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[1][4].total.totalProt = totalProt
          MealFood.mealplan[1][4].total.totalFats = totalFats
          MealFood.mealplan[1][4].total.CarboPer = CarboPer
          MealFood.mealplan[1][4].total.ProtPer = ProtPer
          MealFood.mealplan[1][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 3) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal30 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[2][1].carbs.cal +
            MealFood.mealplan[2][2].proteins.cal +
            MealFood.mealplan[2][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[2][1].carbs.carbs +
            MealFood.mealplan[2][2].proteins.carbs +
            MealFood.mealplan[2][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[2][1].carbs.prot +
            MealFood.mealplan[2][2].proteins.prot +
            MealFood.mealplan[2][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[2][1].carbs.fats +
            MealFood.mealplan[2][2].proteins.fats +
            MealFood.mealplan[2][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[2][0].calories = meal
          MealFood.mealplan[2][4].total.totalCal = totalCal
          MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[2][4].total.totalProt = totalProt
          MealFood.mealplan[2][4].total.totalFats = totalFats
          MealFood.mealplan[2][4].total.CarboPer = CarboPer
          MealFood.mealplan[2][4].total.ProtPer = ProtPer
          MealFood.mealplan[2][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal31 : mealname }});
          var totalCal =
            MealFood.mealplan[2][0].calories.cal +
            meal.cal +
            MealFood.mealplan[2][2].proteins.cal +
            MealFood.mealplan[2][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[2][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[2][2].proteins.carbs +
            MealFood.mealplan[2][3].fats.carbs
          var totalProt =
            MealFood.mealplan[2][0].calories.prot +
            meal.prot +
            MealFood.mealplan[2][2].proteins.prot +
            MealFood.mealplan[2][3].fats.prot
          var totalFats =
            MealFood.mealplan[2][0].calories.fats +
            meal.fats +
            MealFood.mealplan[2][2].proteins.fats +
            MealFood.mealplan[2][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[2][1].carbs = meal
          MealFood.mealplan[2][4].total.totalCal = totalCal
          MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[2][4].total.totalProt = totalProt
          MealFood.mealplan[2][4].total.totalFats = totalFats
          MealFood.mealplan[2][4].total.CarboPer = CarboPer
          MealFood.mealplan[2][4].total.ProtPer = ProtPer
          MealFood.mealplan[2][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal32 : mealname }});
          var totalCal =
            MealFood.mealplan[2][0].calories.cal +
            MealFood.mealplan[2][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[2][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[2][0].calories.carbs +
            MealFood.mealplan[2][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[2][3].fats.carbs
          var totalProt =
            MealFood.mealplan[2][0].calories.prot +
            MealFood.mealplan[2][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[2][3].fats.prot
          var totalFats =
            MealFood.mealplan[2][0].calories.fats +
            MealFood.mealplan[2][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[2][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[2][2].proteins = meal
          MealFood.mealplan[2][4].total.totalCal = totalCal
          MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[2][4].total.totalProt = totalProt
          MealFood.mealplan[2][4].total.totalFats = totalFats
          MealFood.mealplan[2][4].total.CarboPer = CarboPer
          MealFood.mealplan[2][4].total.ProtPer = ProtPer
          MealFood.mealplan[2][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal33 : mealname }});
          var totalCal =
            MealFood.mealplan[2][0].calories.cal +
            MealFood.mealplan[2][1].carbs.cal +
            MealFood.mealplan[2][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[2][0].calories.carbs +
            MealFood.mealplan[2][1].carbs.carbs +
            MealFood.mealplan[2][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[2][0].calories.prot +
            MealFood.mealplan[2][1].carbs.prot +
            MealFood.mealplan[2][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[2][0].calories.fats +
            MealFood.mealplan[2][1].carbs.fats +
            MealFood.mealplan[2][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[2][3].fats = meal
          MealFood.mealplan[2][4].total.totalCal = totalCal
          MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[2][4].total.totalProt = totalProt
          MealFood.mealplan[2][4].total.totalFats = totalFats
          MealFood.mealplan[2][4].total.CarboPer = CarboPer
          MealFood.mealplan[2][4].total.ProtPer = ProtPer
          MealFood.mealplan[2][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 4) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal40 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[3][1].carbs.cal +
            MealFood.mealplan[3][2].proteins.cal +
            MealFood.mealplan[3][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[3][1].carbs.carbs +
            MealFood.mealplan[3][2].proteins.carbs +
            MealFood.mealplan[3][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[3][1].carbs.prot +
            MealFood.mealplan[3][2].proteins.prot +
            MealFood.mealplan[3][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[3][1].carbs.fats +
            MealFood.mealplan[3][2].proteins.fats +
            MealFood.mealplan[3][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[3][0].calories = meal
          MealFood.mealplan[3][4].total.totalCal = totalCal
          MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[3][4].total.totalProt = totalProt
          MealFood.mealplan[3][4].total.totalFats = totalFats
          MealFood.mealplan[3][4].total.CarboPer = CarboPer
          MealFood.mealplan[3][4].total.ProtPer = ProtPer
          MealFood.mealplan[3][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal41 : mealname }});
          var totalCal =
            MealFood.mealplan[3][0].calories.cal +
            meal.cal +
            MealFood.mealplan[3][2].proteins.cal +
            MealFood.mealplan[3][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[3][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[3][2].proteins.carbs +
            MealFood.mealplan[3][3].fats.carbs
          var totalProt =
            MealFood.mealplan[3][0].calories.prot +
            meal.prot +
            MealFood.mealplan[3][2].proteins.prot +
            MealFood.mealplan[3][3].fats.prot
          var totalFats =
            MealFood.mealplan[3][0].calories.fats +
            meal.fats +
            MealFood.mealplan[3][2].proteins.fats +
            MealFood.mealplan[3][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[3][1].carbs = meal
          MealFood.mealplan[3][4].total.totalCal = totalCal
          MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[3][4].total.totalProt = totalProt
          MealFood.mealplan[3][4].total.totalFats = totalFats
          MealFood.mealplan[3][4].total.CarboPer = CarboPer
          MealFood.mealplan[3][4].total.ProtPer = ProtPer
          MealFood.mealplan[3][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal42 : mealname }});
          var totalCal =
            MealFood.mealplan[3][0].calories.cal +
            MealFood.mealplan[3][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[3][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[3][0].calories.carbs +
            MealFood.mealplan[3][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[3][3].fats.carbs
          var totalProt =
            MealFood.mealplan[3][0].calories.prot +
            MealFood.mealplan[3][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[3][3].fats.prot
          var totalFats =
            MealFood.mealplan[3][0].calories.fats +
            MealFood.mealplan[3][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[3][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[3][2].proteins = meal
          MealFood.mealplan[3][4].total.totalCal = totalCal
          MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[3][4].total.totalProt = totalProt
          MealFood.mealplan[3][4].total.totalFats = totalFats
          MealFood.mealplan[3][4].total.CarboPer = CarboPer
          MealFood.mealplan[3][4].total.ProtPer = ProtPer
          MealFood.mealplan[3][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal43 : mealname }});
          var totalCal =
            MealFood.mealplan[3][0].calories.cal +
            MealFood.mealplan[3][1].carbs.cal +
            MealFood.mealplan[3][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[3][0].calories.carbs +
            MealFood.mealplan[3][1].carbs.carbs +
            MealFood.mealplan[3][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[3][0].calories.prot +
            MealFood.mealplan[3][1].carbs.prot +
            MealFood.mealplan[3][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[3][0].calories.fats +
            MealFood.mealplan[3][1].carbs.fats +
            MealFood.mealplan[3][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[3][3].fats = meal
          MealFood.mealplan[3][4].total.totalCal = totalCal
          MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[3][4].total.totalProt = totalProt
          MealFood.mealplan[3][4].total.totalFats = totalFats
          MealFood.mealplan[3][4].total.CarboPer = CarboPer
          MealFood.mealplan[3][4].total.ProtPer = ProtPer
          MealFood.mealplan[3][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 5) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal50 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[4][1].carbs.cal +
            MealFood.mealplan[4][2].proteins.cal +
            MealFood.mealplan[4][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[4][1].carbs.carbs +
            MealFood.mealplan[4][2].proteins.carbs +
            MealFood.mealplan[4][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[4][1].carbs.prot +
            MealFood.mealplan[4][2].proteins.prot +
            MealFood.mealplan[4][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[4][1].carbs.fats +
            MealFood.mealplan[4][2].proteins.fats +
            MealFood.mealplan[4][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[4][0].calories = meal
          MealFood.mealplan[4][4].total.totalCal = totalCal
          MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[4][4].total.totalProt = totalProt
          MealFood.mealplan[4][4].total.totalFats = totalFats
          MealFood.mealplan[4][4].total.CarboPer = CarboPer
          MealFood.mealplan[4][4].total.ProtPer = ProtPer
          MealFood.mealplan[4][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal51 : mealname }});
          var totalCal =
            MealFood.mealplan[4][0].calories.cal +
            meal.cal +
            MealFood.mealplan[4][2].proteins.cal +
            MealFood.mealplan[4][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[4][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[4][2].proteins.carbs +
            MealFood.mealplan[4][3].fats.carbs
          var totalProt =
            MealFood.mealplan[4][0].calories.prot +
            meal.prot +
            MealFood.mealplan[4][2].proteins.prot +
            MealFood.mealplan[4][3].fats.prot
          var totalFats =
            MealFood.mealplan[4][0].calories.fats +
            meal.fats +
            MealFood.mealplan[4][2].proteins.fats +
            MealFood.mealplan[4][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[4][1].carbs = meal
          MealFood.mealplan[4][4].total.totalCal = totalCal
          MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[4][4].total.totalProt = totalProt
          MealFood.mealplan[4][4].total.totalFats = totalFats
          MealFood.mealplan[4][4].total.CarboPer = CarboPer
          MealFood.mealplan[4][4].total.ProtPer = ProtPer
          MealFood.mealplan[4][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal52 : mealname }});
          var totalCal =
            MealFood.mealplan[4][0].calories.cal +
            MealFood.mealplan[4][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[4][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[4][0].calories.carbs +
            MealFood.mealplan[4][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[4][3].fats.carbs
          var totalProt =
            MealFood.mealplan[4][0].calories.prot +
            MealFood.mealplan[4][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[4][3].fats.prot
          var totalFats =
            MealFood.mealplan[4][0].calories.fats +
            MealFood.mealplan[4][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[4][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[4][2].proteins = meal
          MealFood.mealplan[4][4].total.totalCal = totalCal
          MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[4][4].total.totalProt = totalProt
          MealFood.mealplan[4][4].total.totalFats = totalFats
          MealFood.mealplan[4][4].total.CarboPer = CarboPer
          MealFood.mealplan[4][4].total.ProtPer = ProtPer
          MealFood.mealplan[4][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal53 : mealname }});
          var totalCal =
            MealFood.mealplan[4][0].calories.cal +
            MealFood.mealplan[4][1].carbs.cal +
            MealFood.mealplan[4][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[4][0].calories.carbs +
            MealFood.mealplan[4][1].carbs.carbs +
            MealFood.mealplan[4][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[4][0].calories.prot +
            MealFood.mealplan[4][1].carbs.prot +
            MealFood.mealplan[4][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[4][0].calories.fats +
            MealFood.mealplan[4][1].carbs.fats +
            MealFood.mealplan[4][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[4][3].fats = meal
          MealFood.mealplan[4][4].total.totalCal = totalCal
          MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[4][4].total.totalProt = totalProt
          MealFood.mealplan[4][4].total.totalFats = totalFats
          MealFood.mealplan[4][4].total.CarboPer = CarboPer
          MealFood.mealplan[4][4].total.ProtPer = ProtPer
          MealFood.mealplan[4][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 6) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal60 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[5][1].carbs.cal +
            MealFood.mealplan[5][2].proteins.cal +
            MealFood.mealplan[5][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[5][1].carbs.carbs +
            MealFood.mealplan[5][2].proteins.carbs +
            MealFood.mealplan[5][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[5][1].carbs.prot +
            MealFood.mealplan[5][2].proteins.prot +
            MealFood.mealplan[5][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[5][1].carbs.fats +
            MealFood.mealplan[5][2].proteins.fats +
            MealFood.mealplan[5][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[5][0].calories = meal
          MealFood.mealplan[5][4].total.totalCal = totalCal
          MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[5][4].total.totalProt = totalProt
          MealFood.mealplan[5][4].total.totalFats = totalFats
          MealFood.mealplan[5][4].total.CarboPer = CarboPer
          MealFood.mealplan[5][4].total.ProtPer = ProtPer
          MealFood.mealplan[5][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal61 : mealname }});
          var totalCal =
            MealFood.mealplan[5][0].calories.cal +
            meal.cal +
            MealFood.mealplan[5][2].proteins.cal +
            MealFood.mealplan[5][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[5][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[5][2].proteins.carbs +
            MealFood.mealplan[5][3].fats.carbs
          var totalProt =
            MealFood.mealplan[5][0].calories.prot +
            meal.prot +
            MealFood.mealplan[5][2].proteins.prot +
            MealFood.mealplan[5][3].fats.prot
          var totalFats =
            MealFood.mealplan[5][0].calories.fats +
            meal.fats +
            MealFood.mealplan[5][2].proteins.fats +
            MealFood.mealplan[5][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[5][1].carbs = meal
          MealFood.mealplan[5][4].total.totalCal = totalCal
          MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[5][4].total.totalProt = totalProt
          MealFood.mealplan[5][4].total.totalFats = totalFats
          MealFood.mealplan[5][4].total.CarboPer = CarboPer
          MealFood.mealplan[5][4].total.ProtPer = ProtPer
          MealFood.mealplan[5][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal62 : mealname }});
          var totalCal =
            MealFood.mealplan[5][0].calories.cal +
            MealFood.mealplan[5][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[5][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[5][0].calories.carbs +
            MealFood.mealplan[5][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[5][3].fats.carbs
          var totalProt =
            MealFood.mealplan[5][0].calories.prot +
            MealFood.mealplan[5][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[5][3].fats.prot
          var totalFats =
            MealFood.mealplan[5][0].calories.fats +
            MealFood.mealplan[5][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[5][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[5][2].proteins = meal
          MealFood.mealplan[5][4].total.totalCal = totalCal
          MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[5][4].total.totalProt = totalProt
          MealFood.mealplan[5][4].total.totalFats = totalFats
          MealFood.mealplan[5][4].total.CarboPer = CarboPer
          MealFood.mealplan[5][4].total.ProtPer = ProtPer
          MealFood.mealplan[5][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal63 : mealname }});
          var totalCal =
            MealFood.mealplan[5][0].calories.cal +
            MealFood.mealplan[5][1].carbs.cal +
            MealFood.mealplan[5][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[5][0].calories.carbs +
            MealFood.mealplan[5][1].carbs.carbs +
            MealFood.mealplan[5][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[5][0].calories.prot +
            MealFood.mealplan[5][1].carbs.prot +
            MealFood.mealplan[5][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[5][0].calories.fats +
            MealFood.mealplan[5][1].carbs.fats +
            MealFood.mealplan[5][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[5][3].fats = meal
          MealFood.mealplan[5][4].total.totalCal = totalCal
          MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[5][4].total.totalProt = totalProt
          MealFood.mealplan[5][4].total.totalFats = totalFats
          MealFood.mealplan[5][4].total.CarboPer = CarboPer
          MealFood.mealplan[5][4].total.ProtPer = ProtPer
          MealFood.mealplan[5][4].total.FatsPer = FatsPer
        }
      }

      var UpdateMealFood = await query.findOneAndUpdate(
        usermealcoll,
        { _id: usermealId },
        { $set: { mealplan: MealFood.mealplan } }
      )
      return responseModel.successResponse(
        'Meal food swap successfully',
        UpdateMealFood
      )
    } else {
      return responseModel.failResponse('No Food Found!')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      "Error while swaping user's meal food: " + errMessage
    )
  }
}

exports.mealplanStartDate = async function (req) {
  try {
    var data = {
      mealstartdate: req.body.date,
      updateAt: Date.now(),
    }

    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $set: data }
    )
    return responseModel.successResponse(
      'user mealplan start date added successfully.',
      user.mealstartdate
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while adding user mealplan start date: ' + errMessage
    )
  }
}

exports.useruploadphoto = async function (req) {
  try {
    const ProfileBucket = 'mealuserprofilephoto'
    var timestamp = Date.now()
    var localImage = req.body.photo
    var mimetype = req.body.mimetype
    var originalname = req.body.originalname
    var imageRemoteName = timestamp + '-' + originalname
    var splitpath = localImage.split(process.env.serverUrl)[1]
    //console.log(splitpath);
    var fileContent = fs.readFileSync('./public/profilephoto/' + splitpath)

    var para = {
      Key: imageRemoteName,
      ACL: 'public-read',
      Body: fileContent,
      Bucket: ProfileBucket,
      ContentType: mimetype,
    }

    //console.log("params",para);

    const s3Response = await s3.upload(para).promise()
    //console.log("s3Response",s3Response);

    if (s3Response) {
      var imageurl = s3Response.Location
      var data = {
        photourl: imageurl,
        userweight: req.body.weight,
        userbodyfat: req.body.bodyfat,
        userlbm: req.body.lbm,
      }

      let updateUser = await query.findOneAndUpdate(
        collection,
        { _id: req.authenticationUser.authId },
        { $push: { userphoto: data } }
      )

      if (updateUser) {
        var filepath = localImage
        await fileUpload.deleteuserphoto(filepath)
        return responseModel.successResponse(
          'user photo uploaded.',
          updateUser.userphoto
        )
      }
    }

    //let finduser = await query.findOne(collection, { _id: req.authenticationUser.authId });
    // var data = {
    //   photourl: req.body.photo,
    //   userweight : finduser.weight,
    //   userbodyfat : finduser.bodyfat,
    //   userlbm : finduser.lbm
    // };
  } catch (err) {
    var filepath = req.body.photo
    await fileUpload.deleteuserphoto(filepath)
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while uploading user photo: ' + errMessage
    )
  }
}

exports.userMultiPhotoUpload = async function (req) {
  try {
    var uploadType = req.body.uploadType
    // console.log(req.body.uploadType)
    if (uploadType == 0) {
      var photourl = req.body.userphotourls
      var flag
      const ProfileBucket = 'mealuserprofilephoto'
      var userId = req.authenticationUser.authId
      var userweight = req.body.weight
      var userweightType = req.body.userweightType
      var userbodyfat = req.body.bodyfat
      var userlbm = req.body.lbm
      var userbmr = req.body.bmr
      var photodate = req.body.photodate
      var uploadedUrl = []
      var Prefix = userId
      const MaxKeys = 1 // If a single object is found, the folder exists.
      const Bucket = 'mealuserprofilephoto'
      var checkParams = { Bucket, Prefix, MaxKeys }

      var result = await s3.listObjectsV2(checkParams).promise()
      //console.log("result",result);
      var folderExists = result.Contents.length > 0
      if (folderExists) {
        // do nothing
        flag = 1
      } else {
        // make folder in bucket
        var makeFolderParams = {
          Bucket: 'mealuserprofilephoto',
          Key: userId + '/',
          ACL: 'public-read',
          Body: 'body does not matter',
        }
        var folderResult = await s3.upload(makeFolderParams).promise()
        //console.log("folderResult",folderResult);
        if (folderResult) {
        } else {
          return responseModel.failResponse(
            'Error while uploading user photo: ' + err
          )
        }
        flag = 0
      }

      for (let i = 0; i < photourl.length; i++) {
        var element = photourl[i]
        var timestamp = Date.now()
        var localImage = element.savepath
        var mimetype = element.mimetype
        var originalname = element.originalname
        var imageRemoteName = userId + '/' + timestamp + '-' + originalname
        var splitpath = localImage.split(process.env.serverUrl)[1]
        var fileContent = fs.readFileSync('./public/media/' + splitpath)

        var para = {
          Key: imageRemoteName,
          ACL: 'public-read',
          Body: fileContent,
          Bucket: ProfileBucket,
          ContentType: mimetype,
        }

        const s3Response = await s3.upload(para).promise()
        if (s3Response) {
          var uploadurl = s3Response.Location
          var obj = {
            photourl: uploadurl,
          }
          uploadedUrl.push(obj)
        }
      }

      var storePhoto = {
        user_id: userId,
        userphotos: uploadedUrl,
        photodate: photodate,
        userweight: userweight,
        userweightType: userweightType,
        userbodyfat: userbodyfat,
        userlbm: userlbm,
        userbmr: userbmr,
      }

      var checkAnalytic = await query.findOne(useranalyticscoll, {
        user_id: userId,
      })
      if (checkAnalytic) {
        // push data
        var weightdata = {
          userweight: userweight,
          date: req.body.photodate,
          userweightType: req.body.userweightType,
        }

        var bodyfatdata = {
          userbodyfat: userbodyfat,
          date: req.body.photodate,
        }

        var lbmdata = {
          userlbm: userlbm,
          date: req.body.photodate,
        }

        var bmrdata = {
          userbmr: userbmr,
          date: req.body.photodate,
        }

        let updateAnalytic = await query.findOneAndUpdate(
          useranalyticscoll,
          { user_id: userId },
          {
            $set: {
              userweight: userweight,
              userweightType: userweightType,
              userbodyfat: userbodyfat,
              userlbm: userlbm,
              userbmr: userbmr,
              updatedAt: Date.now(),
            },
            $push: {
              weightarr: weightdata,
              bodyfatarr: bodyfatdata,
              lbmarr: lbmdata,
              bmrarr: bmrdata,
            },
          }
        )
      } else {
        // insert data
        var weightdata = {
          userweight: userweight,
          date: req.body.photodate,
          userweightType: req.body.userweightType,
        }

        var bodyfatdata = {
          userbodyfat: userbodyfat,
          date: req.body.photodate,
        }

        var lbmdata = {
          userlbm: userlbm,
          date: req.body.photodate,
        }

        var bmrdata = {
          userbmr: userbmr,
          date: req.body.photodate,
        }

        var analyticObj = {
          user_id: userId,
          weightarr: weightdata,
          bodyfatarr: bodyfatdata,
          lbmarr: lbmdata,
          bmrarr: bmrdata,
          userweight: userweight,
          userweightType: userweightType,
          userbodyfat: userbodyfat,
          userlbm: userlbm,
          userbmr: userbmr,
        }

        let addAnalytic = await query.insert(useranalyticscoll, analyticObj)
      }

      var savePhoto = await query.insert(userphotocoll, storePhoto)
      if (savePhoto) {
        await fileUpload.mediadeletefile(req.body.userphotourls)
      }
      return responseModel.successResponse(
        'User photos uploaded successfully.',
        savePhoto
      )
    } else {
      var userId = req.authenticationUser.authId
      var collectionId = req.body.collectionId
      const ProfileBucket = 'mealuserprofilephoto'
      var photourl = req.body.userphotourls
      var flag
      var photodate = req.body.photodate
      var uploadedUrl = []
      // var userweight = req.body.weight;
      // var userbodyfat = req.body.bodyfat;
      // var userlbm = req.body.lbm;

      for (let i = 0; i < photourl.length; i++) {
        var element = photourl[i]
        var timestamp = Date.now()
        var localImage = element.savepath
        var mimetype = element.mimetype
        var originalname = element.originalname
        var imageRemoteName = userId + '/' + timestamp + '-' + originalname
        var splitpath = localImage.split(process.env.serverUrl)[1]
        var fileContent = fs.readFileSync('./public/media/' + splitpath)

        var para = {
          Key: imageRemoteName,
          ACL: 'public-read',
          Body: fileContent,
          Bucket: ProfileBucket,
          ContentType: mimetype,
        }

        const s3Response = await s3.upload(para).promise()
        if (s3Response) {
          var uploadurl = s3Response.Location
          var obj = {
            photourl: uploadurl,
          }
          uploadedUrl.push(obj)
        }
      }

      var updateCollection = await query.findOneAndUpdate(
        userphotocoll,
        { _id: collectionId },
        { $push: { userphotos: { $each: uploadedUrl } } }
      )
      console.log(updateCollection)
      if (updateCollection) {
        await fileUpload.mediadeletefile(req.body.userphotourls)
      }
      return responseModel.successResponse(
        'User photos uploaded successfully.',
        updateCollection
      )
    }
  } catch (err) {
    await fileUpload.mediadeletefile(req.body.userphotourls)
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while uploading user photo: ' + errMessage
    )
  }
}

exports.userdeletephoto = async function (req) {
  try {
    let finduser = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })
    let arr = finduser.userphoto

    let deletephotoid = req.params.photo_id

    for (let i = 0; i < arr.length; i++) {
      if (arr[i]._id == deletephotoid) {
        await fileUpload.deleteuserphoto(arr[i].photourl)
      }
    }

    let updateuser = await query.updateOne(
      collection,
      { _id: req.authenticationUser.authId },
      { $pull: { userphoto: { _id: deletephotoid } } },
      false,
      true
    )

    let user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })
    var userphotos = user.userphoto

    return responseModel.successResponse(
      'user photo deleted successfully',
      userphotos
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while deleting user photo: ' + errMessage
    )
  }
}

exports.userPhotoDelete = async function (req) {
  try {
    var userId = req.authenticationUser.authId
    //let finduser = await query.findOne(collection, { _id: userId });
    var collectionId = req.body.collectionId
    var photoId = req.body.photoId
    const ProfileBucket = 'mealuserprofilephoto'

    var getCollection = await query.findOne(userphotocoll, {
      $and: [{ _id: collectionId }, { user_id: userId }],
    })
    if (getCollection) {
      var photoArray = getCollection.userphotos

      for (let i = 0; i < photoArray.length; i++) {
        if (photoArray[i]._id == photoId) {
          var photo = photoArray[i].photourl
          var split = photo.split(
            '' + userId + '/'
          )[1]
          var param = {
            Bucket: ProfileBucket,
            Key: userId + '/' + split,
          }

          var deletePhoto = await s3.deleteObject(param).promise()
          //console.log("deletePhoto",deletePhoto);
          if (deletePhoto) {
            let updateCollection = await query.updateOne(
              userphotocoll,
              { _id: collectionId },
              { $pull: { userphotos: { _id: photoId } } },
              false,
              true
            )

            var getCollectionUpdated = await query.findOne(userphotocoll, {
              $and: [{ _id: collectionId }, { user_id: userId }],
            })

            return responseModel.successResponse(
              'Photo deleted successfully',
              getCollectionUpdated
            )
          } else {
            return responseModel.failResponse(
              'Error while delete photo: ' + err
            )
          }
        }
      }
    } else {
      return responseModel.failResponse('No such photo collection found.')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while deleting photo: ' + errMessage
    )
  }
}

exports.userDeleteCollection = async function (req) {
  try {
    var userId = req.authenticationUser.authId
    var collectionId = req.params.photo_id
    const ProfileBucket = 'mealuserprofilephoto'
    var getCollection = await query.findOne(userphotocoll, {
      _id: collectionId,
    })
    if (getCollection) {
      var userPhotos = getCollection.userphotos
      if (userPhotos.length > 0) {
        for (let i = 0; i < userPhotos.length; i++) {
          var element = userPhotos[i]
          var photo = element.photourl
          var split = photo.split(
            '' + userId + '/'
          )[1]
          var param = {
            Bucket: ProfileBucket,
            Key: userId + '/' + split,
          }

          var deletePhoto = await s3.deleteObject(param).promise()
        }

        var deleteCollection = await query.deleteOne(userphotocoll, {
          _id: collectionId,
        })
        if (deleteCollection) {
          return responseModel.successResponse(
            'Photo collection delete successfully',
            deleteCollection
          )
        }
      } else {
        var deleteCollection = await query.deleteOne(userphotocoll, {
          _id: collectionId,
        })
        if (deleteCollection) {
          return responseModel.successResponse(
            'Photo collection delete successfully',
            deleteCollection
          )
        }
      }
    } else {
      return responseModel.failResponse('No such photo collection found.')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while deleting photo collection: ' + errMessage
    )
  }
}

exports.userphotolist = async function (req) {
  try {
    let user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })
    var userphotos = user.userphoto
    return responseModel.successResponse(
      'user photo list get successfully.',
      userphotos
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while getting user photo list: ' + errMessage
    )
  }
}
//working api
exports.userListPhoto = async function (req) {
  try {
    var limit =
      req.body.limit != '' && req.body.limit != undefined
        ? parseInt(req.body.limit)
        : 10
    var pageNo =
      req.body.pageNo != '' && req.body.pageNo != undefined
        ? parseInt(req.body.pageNo)
        : 1
    var skip = (pageNo - 1) * limit
    var total_record = limit * pageNo
    var nextPage
    var userId = req.authenticationUser.authId

    var filter = { $and: [{ user_id: mongoose.Types.ObjectId(userId) }] }
    var aggArr = [{ $match: filter }, { $sort: { _id: -1 } }]
    var totalPhotoList = await query.aggregate(userphotocoll, aggArr)
    aggArr.push({ $skip: skip }, { $limit: limit })
    var userPhotoList = await query.aggregate(userphotocoll, aggArr)
    // console.log(userPhotoList);
    var total = totalPhotoList.length

    if (total_record < total) {
      nextPage = nextPage = pageNo + 1
    } else {
      nextPage = -1
    }
    var totalPages = Math.ceil(totalPhotoList.length / limit)
    return responseModel.successResponse('User photo list get successfully: ', {
      userPhotoList: userPhotoList,
      totalPhotoList: totalPhotoList.length,
      totalPages: userPhotoList.length > 0 ? totalPages : 0,
      nextPage: nextPage,
    })
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while getting user photo list: ' + errMessage
    )
  }
}

exports.userplansubscribe = async function (req) {
  try {
    var plan_id = req.body.plan_id
    let plan = await query.findOne(premiumplancoll, { _id: plan_id })
    if (plan) {
      var planterm = plan.planterm
      var plan_end_date = new Date(moment(new Date()).add(planterm, 'months'))

      let plantdetail = {
        _id: plan_id,
        plantitle: plan.plantitle,
        planPackageName: plan.planPackageName,
        planprice: plan.planprice,
        planterm: plan.planterm,
        plansubscription: plan.subscription,
        plan_start_date: Date.now(),
        plan_end_date: plan_end_date,
      }

      let user = await query.findOneAndUpdate(
        collection,
        { _id: req.authenticationUser.authId },
        { $set: { plantdetails: plantdetail, isPremium: true } }
      )
      return responseModel.successResponse(
        'Plan sucessfully subscribed.',
        user.plantdetails
      )
    } else {
      return responseModel.failResponse('No Premium Plan Found!')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while subscrbing plan: ' + errMessage
    )
  }
}

exports.userchecksub = async function (req) {
  try {
    let user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })
    var TodayDate = Date.now()
    var userplanexpiry = user.plantdetails.plan_end_date
    if (TodayDate > userplanexpiry) {
      var isSubscription = false
    } else {
      var isSubscription = true
    }

    return responseModel.successResponse(
      'Plan subscription detail',
      isSubscription
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while checking subscription: ' + errMessage
    )
  }
}

exports.usergrocerie = async function (req) {
  try {
    var todayDate = new Date(new Date().setUTCHours(0, 0, 0, 0))
    // var Date = req.body.pickedDate;
    let user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })
    let usermealplan = await query.findOne(usermealcoll, {
      $and: [
        { user_id: req.authenticationUser.authId },
        { mealplandate: todayDate },
      ],
    })
    if (usermealplan) {
      var mealplanarr = usermealplan.mealplan
      var groceriearr = []

      for (let i = 0; i < 1; i++) {
        // var mealplantype = "mealplan" + [i+1];

        var mealarr = mealplanarr
        for (let j = 0; j < mealarr.length; j++) {
          const element = mealarr[j]
          //console.log(mealarr[0]);

          var caloriesfood = element[0].calories.grocery_list_name
          var carbfood = element[1].carbs.grocery_list_name
          var protinfood = element[2].proteins.grocery_list_name
          var fatsfood = element[3].fats.grocery_list_name
          var title = 'meal' + [j + 1]

          var list = { title, caloriesfood, carbfood, protinfood, fatsfood }
          // console.log(list);
          // mealplantype
          groceriearr.push(list)
        }
      }
    } else {
      return responseModel.failResponse(
        "You don't have any meal plan generated."
      )
    }
    return responseModel.successResponse('Grocerie list', groceriearr)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while getting Grocerie list: ' + errMessage
    )
  }
}

//new pdf api

exports.newmealplanpdfgenerate = async function (req, res) {
  console.log(req.body)
  var userId = req.authenticationUser.authId
  var mealdate = req.body.date
  var mealDate = moment(mealdate).format('D MMMM YYYY')
  var user = await query.findOne(collection, { _id: userId })
  var usermealplan = await query.findOne(usermealcoll, {
    $and: [{ user_id: userId }, { mealplandate: mealdate }],
  })

  try {
    if (usermealplan) {
      console.log(user)
      var mealplanarr = usermealplan.mealplan
      console.log(mealplanarr)
      var icon =
        ''
      var mealPlanDate = moment(usermealplan.mealplandate).format('D MMMM')
      var mealPlanArr = usermealplan.mealplan
      let timestamp = Date.now()
      var totalCal = 0
      var totalFat = 0
      var totalProtein = 0
      var totalCarbs = 0
      for (let i = 0; i < mealPlanArr.length; i++) {
        totalCal += mealPlanArr[i][4].total.totalCal
        totalCarbs += mealPlanArr[i][4].total.totalCarbo
        totalProtein += mealPlanArr[i][4].total.totalProt
        totalFat += mealPlanArr[i][4].total.totalFats
      }

      var mealarr = usermealplan.mealplan
      for (let i = 0; i < mealarr.length; i++) {
        if (!mealarr[i][0].calories.grocery_list_name.includes('1.', 0)) {
          mealarr[i][0].calories.grocery_list_name =
            '1. ' + mealarr[i][0].calories.grocery_list_name
        }
        if (!mealarr[i][1].carbs.grocery_list_name.includes('1.', 0)) {
          mealarr[i][1].carbs.grocery_list_name =
            '1. ' + mealarr[i][1].carbs.grocery_list_name
        }
        if (!mealarr[i][2].proteins.grocery_list_name.includes('1.', 0)) {
          mealarr[i][2].proteins.grocery_list_name =
            '1. ' + mealarr[i][2].proteins.grocery_list_name
        }
        if (!mealarr[i][3].fats.grocery_list_name.includes('1.', 0)) {
          mealarr[i][3].fats.grocery_list_name =
            '1. ' + mealarr[i][3].fats.grocery_list_name
        }
      }
      if (user.gender == 'female') {
        ejs.renderFile(
          path.join(__dirname, '../views/', 'femaleTemplate.ejs'),
          {
            icon: icon,
            mealPlanDate: mealPlanDate,
            mealplanarr: mealplanarr,
            mealarr: mealarr,
            totalCal: totalCal,
            totalFat: totalFat,
            totalProtein: totalProtein,
            totalCarbs: totalCarbs,
            mealPlanArr: mealPlanArr,
            mealDate: mealDate,
          },
          (err, data) => {
            if (err) {
              return res.status(500).send({
                success: false,
                message: 'Something wrong happend',
                data: err,
              })
            } else {
              let options = { format: 'A4', border: '1cm' }

              pdf.create(data, options).toBuffer(async (err, buffer) => {
                if (err) {
                  console.log(err)
                  return res.status(500).send({
                    success: false,
                    message: 'Something wrong happend',
                    data: err,
                  })
                }
                var fileName = userId + '-mealplanpdf'
                var params = {
                  Key: fileName,
                  ACL: 'public-read',
                  Body: buffer,
                  Bucket: MealplanPdfBucket,
                  ContentType: 'application/pdf',
                }

                const s3Response = await s3.upload(params).promise()
                if (s3Response) {
                  console.log(s3Response)
                  var pdfurl = s3Response.Location

                  var updateUrl = await query.findOneAndUpdate(
                    collection,
                    { _id: userId },
                    { $set: { mealPdfUrl: pdfurl } }
                  )
                  return res.status(200).send({
                    success: true,
                    message: 'Your Mealplan Pdf generated successfully.',
                    data: pdfurl,
                  })
                }
              })
            }
          }
        )
      }

      if (user.gender == 'male') {
        ejs.renderFile(
          path.join(__dirname, '../views/', 'maleTemplate.ejs'),
          {
            icon: icon,
            mealPlanDate: mealPlanDate,
            mealplanarr: mealplanarr,
            mealarr: mealarr,
            totalCal: totalCal,
            totalFat: totalFat,
            totalProtein: totalProtein,
            totalCarbs: totalCarbs,
            mealPlanArr: mealPlanArr,
            mealDate: mealDate,
          },
          (err, data) => {
            if (err) {
              return res.status(500).send({
                success: false,
                message: 'Something wrong happend',
                data: err,
              })
            } else {
              let options = { format: 'A4', border: '1cm' }

              pdf.create(data, options).toBuffer(async (err, buffer) => {
                if (err) {
                  console.log(err)
                  return res.status(500).send({
                    success: false,
                    message: 'Something wrong happend',
                    data: err,
                  })
                }
                var fileName = userId + '-mealplanpdf'
                var params = {
                  Key: fileName,
                  ACL: 'public-read',
                  Body: buffer,
                  Bucket: MealplanPdfBucket,
                  ContentType: 'application/pdf',
                }

                const s3Response = await s3.upload(params).promise()
                if (s3Response) {
                  console.log(s3Response)
                  var pdfurl = s3Response.Location

                  var updateUrl = await query.findOneAndUpdate(
                    collection,
                    { _id: userId },
                    { $set: { mealPdfUrl: pdfurl } }
                  )
                  return res.status(200).send({
                    success: true,
                    message: 'Your Mealplan Pdf generated successfully.',
                    data: pdfurl,
                  })
                }
              })
            }
          }
        )
      }
    } else {
      return res.status(500).send({
        success: false,
        message: "user don't have any meal plan",
      })
    }
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: 'Error while generating mealplan pdf',
      data: err,
    })
  }
}

// Old format
exports.mealplanpdfgenerate = async function (req) {
  try {
    var userId = req.authenticationUser.authId
    var mealdate = req.body.date
    var user = await query.findOne(collection, { _id: userId })
    var usermealplan = await query.findOne(usermealcoll, {
      $and: [{ user_id: userId }, { mealplandate: mealdate }],
    })
    var waterintake = usermealplan.mealwaterdata
    // console.log(usermealplan);

    if (usermealplan) {
      var mealplanarr = usermealplan.mealplan
      let doc = new PDFDocument({ size: 'A4', margin: 20 })
      try {
        await generateHeader(doc, user, waterintake)
        await generateMealplan(doc, mealplanarr)
        await generateFooter(doc)
      } catch (error) {
        //console.log(error);
      }

      doc.end()
      // var Prefix = userId;
      // const MaxKeys = 1; // If a single object is found, the folder exists.
      // const params = { MealplanPdfBucket, Prefix, MaxKeys };
      // var fileName = userId+'/'+userId+'-'+timestamp+'-mealplanpdf';

      var fileName = userId + '-mealplanpdf'

      var params = {
        Key: fileName,
        ACL: 'public-read',
        Body: doc,
        Bucket: MealplanPdfBucket,
        ContentType: 'application/pdf',
      }

      const s3Response = await s3.upload(params).promise()
      //console.log("s3Response",s3Response);

      if (s3Response) {
        var pdfurl = s3Response.Location
        var updateUrl = await query.findOneAndUpdate(
          collection,
          { _id: userId },
          { $set: { mealPdfUrl: pdfurl } }
        )
        return responseModel.successResponse(
          'Your Mealplan Pdf generated successfully.',
          pdfurl
        )
      }
    } else {
      return responseModel.successResponse("user don't have any meal plan")
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while generating mealplan pdf: ' + errMessage
    )
  }
}

async function generateHeader(doc, user, waterintake) {
  var icon = ''
  var glass = ''
  let iconBuffer = await doRequest(icon)
  let glassBuffer = await doRequest(glass)
  // console.log("iconBuffer",iconBuffer);
  // console.log("glassBuffer",glassBuffer);

  doc
    .image(iconBuffer, 260, 80, {
      align: 'center',
      valign: 'center',
      width: 80,
    })
    .fontSize(20)
    .text('MEAL ID', 20, 180, { align: 'center' })
    .fontSize(10)
    .text('Name: ' + user.name, 20, 210, { align: 'center', align: 'justify' })
    //.text("Date: "+moment().format('MMMM Do YYYY'), 20 , 210, { align: "right" })
    .image(glassBuffer, 500, 200, { align: 'right', width: 70 })
    .text('Water Intake: ' + waterintake + ' cups', 20, 265, { align: 'right' })
    .text('Weight: ' + user.weight + ' lbs', 20, 230, {
      align: 'center',
      align: 'justify',
    })
    .text('Body Fat: ' + user.bodyfat + '%', 20, 250, {
      align: 'center',
      align: 'justify',
    })
    .font('./public/Roboto/Roboto-Regular.ttf')
    .moveDown()
}

async function generateMealplan(doc, mealplanarr) {
  var space = 260
  for (let i = 0; i < 1; i++) {
    // console.log("---",i,space);
    var mealarr = mealplanarr

    doc
    generateHr(doc, space + 20)
    //   .font("./public/Roboto/Roboto-Regular.ttf")
    //   .fontSize(15)
    //   .text("Meal Plan ", 50, space, { align: "center" }) //"Meal Plan "+ [i+1]

    for (let j = 0; j < mealarr.length; j++) {
      var element = mealarr[j]
      var mealspace = 0
      if (j > 0) {
        doc.addPage()
        space = 10
      }

      doc
        .font('./public/Roboto/Roboto-Regular.ttf')
        .fontSize(13)
        .text('Meal ' + [j + 1], 20, space + 40, { align: 'center' })

      for (let k = 0; k < element.length - 1; k++) {
        var innermealspace = 0
        var category
        if (k == 0) {
          category = 'calories'
        }
        if (k == 1) {
          category = 'carbs'
        }
        if (k == 2) {
          category = 'proteins'
        }
        if (k == 3) {
          category = 'fats'
        }

        var image = element[k][category].image_name
        // console.log("image-->",image);
        var imageBuffer = await doRequest(image)
        //console.log("imageBuffer",imageBuffer);
        //var photo = image.split('http://localhost:9000/')[1]
        //console.log(photo);

        doc
          .font('./public/Roboto/Roboto-Regular.ttf')
          //.image("./public/meal/" +photo+".jpg", 20, space + 60, { width: 75 })
          //.image("./public/meal/" +photo, 20, space + 60, { width: 75 })
          .image(imageBuffer, 20, space + 60, { width: 75 })
          .fontSize(12)
          .text(
            element[k][category].name + ' (' + element[k][category].size + ')',
            110,
            space + 60
          )
          .fontSize(12)
          .text('Calories: ' + element[k][category].cal, 110, space + 75)
          .fontSize(12)
          .text('Carbs: ' + element[k][category].carbs + ' g', 110, space + 90)
          .fontSize(12)
          .text(
            'Proteins: ' + element[k][category].prot + ' g',
            110,
            space + 105
          )
          .fontSize(12)
          .text('Fats: ' + element[k][category].fats + ' g', 110, space + 120)

        innermealspace = 90
        space = space + innermealspace
      }

      mealspace = 30
      space = space + mealspace
    }

    lastmealspace = 50
    space = space + lastmealspace
  }
}

function generateFooter(doc) {
  doc
    //.image("./public/mealid_icon.png", 270,700, { align: 'center', valign: 'center', width: 50 })
    .font('./public/Roboto/Roboto-Regular.ttf')
    .fontSize(15)
    .text('Thank you for using Meal ID.', 50, 750, {
      align: 'center',
      width: 500,
    })
}

function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke()
}

exports.update_weight_bodyfat = async function (req) {
  try {
    var data = {
      weight: req.body.weight,
      weightType: req.body.weightType,
      bodyfat: req.body.bodyfat,
      updateAt: Date.now(),
    }
    var weightdata = {
      userweight: req.body.weight,
      date: Date.now(),
    }
    var bodyfatdata = {
      userbodyfat: req.body.bodyfat,
      date: Date.now(),
    }

    let user = await query.findOneAndUpdate(
      collection,
      { _id: req.authenticationUser.authId },
      { $push: { weightarr: weightdata, bodyfatarr: bodyfatdata }, $set: data }
    )
    return responseModel.successResponse('user weigh and bodyfat updated', user)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user weigh and bodyfat: ' + errMessage
    )
  }
}

exports.useractivity = async function (req) {
  console.log(req)
  try {
    var category = req.body.category //1 - weight ,2 - bodyfat ,3 - bmr , 4 - lbm
    var filterType = req.body.filterType
    var filterarr
    var filtertext
    var displaytext
    var userId = req.authenticationUser.authId
    let user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })

    if (category == 1) {
      ;(filterarr = 'weightarr'),
        (filtertext = 'userweight'),
        (displaytext = 'weight'),
        (previous = 0)
    }
    if (category == 2) {
      ;(filterarr = 'bodyfatarr'),
        (filtertext = 'userbodyfat'),
        (displaytext = 'bodyfat'),
        (previous = 0)
    }
    if (category == 3) {
      ;(filterarr = 'bmrarr'),
        (filtertext = 'userbmr'),
        (displaytext = 'bmr'),
        (previous = 0)
    }
    if (category == 4) {
      ;(filterarr = 'lbmarr'),
        (filtertext = 'userlbm'),
        (displaytext = 'lbm'),
        (previous = 0)
    }

    if (filterType == 1) {
      // lastWeek
      var startOfWeek = moment()
        .subtract(1, 'weeks')
        .startOf('week')
        .format('YYYY-MM-DD')
      var endOfWeek = moment()
        .subtract(1, 'weeks')
        .endOf('week')
        .format('YYYY-MM-DD')
      var start = new Date(startOfWeek)
      var end = new Date(new Date(endOfWeek).setUTCHours(23, 59, 59, 999))
      // console.log("start--",start);
      // console.log("end--",end);
      var groupby = 'day'
    }

    if (filterType == 2) {
      // lastMonth
      var startOfMonth = moment()
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DD')
      var endOfMonth = moment()
        .subtract(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DD')
      var start = new Date(startOfMonth)
      var end = new Date(new Date(endOfMonth).setUTCHours(23, 59, 59, 999))
      // console.log("start--",start);
      // console.log("end--",end);
      var groupby = 'week'
    }

    if (filterType == 3) {
      // Custom Date
      var start = req.body.startdate
      var end = req.body.enddate
      // console.log("start--",start);
      // console.log("end--",end);
      var groupby = 'week'
    }

    let filter = {
      $and: [
        { user_id: mongoose.Types.ObjectId(userId) },
        { [filterval]: { $gte: new Date(start), $lte: new Date(end) } },
      ],
    }

    // let filter = {
    //   $and: [
    //     { _id : mongoose.Types.ObjectId(userId) },
    //     { [filterval] : { $gte: new Date(start), $lte: new Date(end) } }
    //   ]
    // };

    //console.log(filter);

    var dtrange = daterange.range(start, end)

    let GroupBy
    let SortBy
    let Project
    let Xarray
    let finalresult = []

    if (groupby == 'week') {
      GroupBy = {
        week: { $week: '$' + filterarr + '.date' },
        year: { $year: '$' + filterarr + '.date' },
      }

      SortBy = { '_id.year': 1, '_id.week': 1 }
      Project = {
        totalcount: 1,
        week: '$_id.week',
        year: '$_id.year',
        _id: 0,
        data: 1,
      }
      Xarray = Array.from(dtrange.by('weeks'))

      let aggregateArr = [
        { $unwind: '$' + filterarr },
        { $match: filter },
        {
          $group: {
            _id: GroupBy,
            totalcount: { $sum: 1 },
            data: {
              $push: { [filtertext]: '$' + filterarr + '.' + filtertext },
            },
          },
        },
        { $sort: SortBy },
        {
          $project: Project,
        },
      ]

      let result = await query.aggregate(useranalyticscoll, aggregateArr)
      //let result = await query.aggregate(collection,aggregateArr);
      //console.log("res",result);
      if (result.length == 0) {
        return responseModel.failResponse('No Data Found of user activity!')
      }
      //console.log("Xarray.length",Xarray.length);
      if (Xarray && Xarray.length > 0) {
        let X = Xarray.map((m) => {
          return m.format('YYYY-MM-DD')
        })

        _.map(X, function (obj) {
          let Week = moment(obj).week()
          let Year = moment(obj).year()
          let dayObj = _.find(result, { week: Week - 1, year: Year })

          if (dayObj != undefined) {
            if (dayObj.data.length > 0) {
              var arr = dayObj.data
              //console.log("arr",arr);
              var ratearray = _.map(arr, filtertext)
              //console.log("ratearray",ratearray);
              var totalrate = _.size(ratearray)
              var ratecount = _.sum(ratearray)

              if (totalrate == 0 && ratecount == 0) {
                var avg = 0
              } else {
                var temp = ratecount / totalrate
                var avg = Math.round(temp)
              }
            }
          }

          // if(dayObj != undefined ){
          //   if(dayObj.data[0][filtertext] != undefined){
          //     previous = dayObj.data[0][filtertext]
          //     console.log("previous",previous);
          //     console.log("--",dayObj.data[0][filtertext]);
          //   }
          // }

          finalresult.push({
            [displaytext]: dayObj && dayObj.data && avg ? avg : 0,
            // [displaytext] : dayObj && dayObj.data && dayObj.data[0][filtertext] ? dayObj.data[0][filtertext] : previous,
            week: moment()
              .year(Year)
              .week(Week)
              .day('sunday')
              .format('YYYY-MM-DD'),
          })
        })
      }
    }

    if (groupby == 'day') {
      GroupBy = {
        [displaytext]: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$' + filterarr + '.date',
          },
        },
      }

      SortBy = { ['_id.' + displaytext]: 1 }

      Project = {
        totalcount: 1,
        [displaytext]: '$_id.' + displaytext,
        _id: 0,
        data: 1,
      }

      Xarray = Array.from(dtrange.by('days'))

      let aggregateArr = [
        { $unwind: '$' + filterarr },
        { $match: filter },
        {
          $group: {
            _id: GroupBy,
            totalcount: { $sum: 1 },
            data: {
              $push: { [filtertext]: '$' + filterarr + '.' + filtertext },
            },
          },
        },
        { $sort: SortBy },
        {
          $project: Project,
        },
      ]

      let result = await query.aggregate(useranalyticscoll, aggregateArr)
      if (result.length == 0) {
        return responseModel.failResponse('No Data Found of user activity!')
      }

      if (Xarray && Xarray.length > 0) {
        let X = Xarray.map((m) => {
          return m.format('YYYY-MM-DD')
        })

        _.map(X, function (obj) {
          let dayObj = _.find(result, { [displaytext]: obj })

          if (dayObj != undefined) {
            if (dayObj.data[0][filtertext] != undefined) {
              previous = dayObj.data[0][filtertext]
            }
          }

          finalresult.push({
            // totalcount: dayObj && dayObj.totalcount ? dayObj.totalcount : 0,
            // weight : wdayObj && wdayObj.data && wdayObj.data[0].userweight ? wdayObj.data[0].userweight : wprevious,
            [displaytext]:
              dayObj && dayObj.data && dayObj.data[0][filtertext]
                ? dayObj.data[0][filtertext]
                : previous,
            day: obj,
          })
        })
      }
    }

    return responseModel.successResponse('user activity graph', finalresult)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while generating graph: ' + errMessage
    )
  }
}

exports.realTimeActivityGraph = async function (req) {
  try {
    var limit =
      req.body.limit != '' && req.body.limit != undefined
        ? parseInt(req.body.limit)
        : 7
    var pageNo =
      req.body.pageNo != '' && req.body.pageNo != undefined
        ? parseInt(req.body.pageNo)
        : 1
    var skip = (pageNo - 1) * limit
    var category = req.body.category //1 - weight ,2 - bodyfat ,3 - bmr , 4 - lbm
    var filterType = req.body.filterType //1 - lastWeek, 2 - lastMonth, 3 - Custom Date
    var filterarr
    var filtertext
    var displaytext
    var filter
    var userId = req.authenticationUser.authId

    if (category == 1) {
      ;(filterarr = 'weightarr'),
        (filtertext = 'userweight'),
        (displaytext = 'weight'),
        (previous = 0)
    }
    if (category == 2) {
      ;(filterarr = 'bodyfatarr'),
        (filtertext = 'userbodyfat'),
        (displaytext = 'bodyfat'),
        (previous = 0)
    }
    if (category == 3) {
      ;(filterarr = 'bmrarr'),
        (filtertext = 'userbmr'),
        (displaytext = 'bmr'),
        (previous = 0)
    }
    if (category == 4) {
      ;(filterarr = 'lbmarr'),
        (filtertext = 'userlbm'),
        (displaytext = 'lbm'),
        (previous = 0)
    }

    if (filterType == 1) {
      // lastWeek
      var startOfWeek = moment()
        .subtract(1, 'weeks')
        .startOf('week')
        .format('YYYY-MM-DD')
      var endOfWeek = moment()
        .subtract(1, 'weeks')
        .endOf('week')
        .format('YYYY-MM-DD')
      var start = new Date(startOfWeek)
      var end = new Date(new Date(endOfWeek).setUTCHours(23, 59, 59, 999))
      // console.log("start--",start);
      // console.log("end--",end);
      var groupby = 'day'

      let filterval = filterarr + '.date'
      filter = {
        $and: [
          { user_id: mongoose.Types.ObjectId(userId) },
          { [filterval]: { $gte: new Date(start), $lte: new Date(end) } },
        ],
      }
    }

    if (filterType == 2) {
      // lastMonth
      var startOfMonth = moment()
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DD')
      var endOfMonth = moment()
        .subtract(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DD')
      var start = new Date(startOfMonth)
      var end = new Date(new Date(endOfMonth).setUTCHours(23, 59, 59, 999))
      // console.log("start--",start);
      // console.log("end--",end);
      var groupby = 'day'
      let filterval = filterarr + '.date'
      filter = {
        $and: [
          { user_id: mongoose.Types.ObjectId(userId) },
          { [filterval]: { $gte: new Date(start), $lte: new Date(end) } },
        ],
      }
    }

    if (filterType == 3) {
      // Custom Date
      if (req.body.startdate != '' && req.body.enddate != '') {
        var start = req.body.startdate
        var end = req.body.enddate
        var filterval = filterarr + '.date'
        filter = {
          $and: [
            { user_id: mongoose.Types.ObjectId(userId) },
            { [filterval]: { $gte: new Date(start), $lte: new Date(end) } },
          ],
        }
      } else {
        filter = {
          $and: [{ user_id: mongoose.Types.ObjectId(userId) }],
        }
      }
      var groupby = 'day'
    }

    //var dtrange = daterange.range(start, end);

    let GroupBy
    let SortBy
    let Project
    let Xarray
    let finalresult = []

    if (groupby == 'week') {
      GroupBy = {
        week: { $week: '$' + filterarr + '.date' },
        year: { $year: '$' + filterarr + '.date' },
      }

      SortBy = { '_id.year': 1, '_id.week': 1 }
      Project = {
        totalcount: 1,
        week: '$_id.week',
        year: '$_id.year',
        _id: 0,
        data: 1,
      }
      Xarray = Array.from(dtrange.by('weeks'))

      let aggregateArr = [
        { $unwind: '$' + filterarr },
        { $match: filter },
        {
          $group: {
            _id: GroupBy,
            totalcount: { $sum: 1 },
            data: {
              $push: { [filtertext]: '$' + filterarr + '.' + filtertext },
            },
          },
        },
        { $sort: SortBy },
        {
          $project: Project,
        },
      ]

      let result = await query.aggregate(useranalyticscoll, aggregateArr)
      //let result = await query.aggregate(collection,aggregateArr);
      //console.log("res",result);
      if (result.length == 0) {
        return responseModel.failResponse('No Data Found of user activity!')
      }
      //console.log("Xarray.length",Xarray.length);
      if (Xarray && Xarray.length > 0) {
        let X = Xarray.map((m) => {
          return m.format('YYYY-MM-DD')
        })

        _.map(X, function (obj) {
          let Week = moment(obj).week()
          let Year = moment(obj).year()
          let dayObj = _.find(result, { week: Week - 1, year: Year })

          if (dayObj != undefined) {
            if (dayObj.data.length > 0) {
              var arr = dayObj.data
              //console.log("arr",arr);
              var ratearray = _.map(arr, filtertext)
              //console.log("ratearray",ratearray);
              var totalrate = _.size(ratearray)
              var ratecount = _.sum(ratearray)

              if (totalrate == 0 && ratecount == 0) {
                var avg = 0
              } else {
                var temp = ratecount / totalrate
                var avg = Math.round(temp)
              }
            }
          }

          // if(dayObj != undefined ){
          //   if(dayObj.data[0][filtertext] != undefined){
          //     previous = dayObj.data[0][filtertext]
          //     console.log("previous",previous);
          //     console.log("--",dayObj.data[0][filtertext]);
          //   }
          // }

          finalresult.push({
            [displaytext]: dayObj && dayObj.data && avg ? avg : 0,
            // [displaytext] : dayObj && dayObj.data && dayObj.data[0][filtertext] ? dayObj.data[0][filtertext] : previous,
            week: moment()
              .year(Year)
              .week(Week)
              .day('sunday')
              .format('YYYY-MM-DD'),
          })
        })
      }
    }

    if (groupby == 'day') {
      GroupBy = {
        [displaytext]: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$' + filterarr + '.date',
          },
        },
      }

      SortBy = { ['_id.' + displaytext]: -1 }

      Project = {
        totalcount: 1,
        [displaytext]: '$_id.' + displaytext,
        _id: 0,
        data: 1,
      }

      //Xarray = Array.from(dtrange.by("days"));

      let aggregateArr = [
        { $unwind: '$' + filterarr },
        { $match: filter },
        {
          $group: {
            _id: GroupBy,
            totalcount: { $sum: 1 },
            data: {
              $push: { [filtertext]: '$' + filterarr + '.' + filtertext },
            },
          },
        },
        { $sort: SortBy },
        {
          $project: Project,
        },
      ]

      let totalresult = await query.aggregate(useranalyticscoll, aggregateArr)
      aggregateArr.push({ $skip: skip }, { $limit: limit })
      let result = await query.aggregate(useranalyticscoll, aggregateArr)

      var resultCount = result.length
      if (result.length == 0) {
        return responseModel.failResponse('No Data Found of user activity!')
      }

      var total = totalresult.length

      var totalPages = Math.ceil(totalresult.length / limit)

      for (let i = 0; i < result.length; i++) {
        var element = result[i]
        var obj = {
          [displaytext]: element.data[0][filtertext],
          day: element[displaytext],
        }
        finalresult.push(obj)
      }
    }

    function compare(a, b) {
      // Use toUpperCase() to ignore character casing
      const bandA = a.day.toUpperCase()
      const bandB = b.day.toUpperCase()

      let comparison = 0
      if (bandA > bandB) {
        comparison = 1
      } else if (bandA < bandB) {
        comparison = -1
      }
      return comparison
    }

    var sortResultAsc = finalresult.sort(compare)

    return responseModel.successResponse('user activity graph', {
      graphdata: sortResultAsc,
      totalRecord: total,
      totalPages: resultCount > 0 ? totalPages : 0,
    })
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while generating graph: ' + errMessage
    )
  }
}

exports.realTimeUserGraph = async function (req) {
  console.log(req.body)
  try {
    var limit =
      req.body.limit != '' && req.body.limit != undefined
        ? parseInt(req.body.limit)
        : 7
    var pageNo =
      req.body.pageNo != '' && req.body.pageNo != undefined
        ? parseInt(req.body.pageNo)
        : 1
    var skip = (pageNo - 1) * limit
    var category = req.body.category //1 - weight ,2 - bodyfat ,3 - bmr , 4 - lbm
    // var filterType = req.body.filterType;//1 - lastWeek, 2 - lastMonth, 3 - Custom Date
    var newfilterType = req.body.newfilterType //1 - 1month, 2 - past 3 months, 3 -past 6 months, 4 - past 6 months,
    var filterarr
    var filtertext
    var userweightType
    var displayweightType
    var displaytext
    var filter
    var userId = req.authenticationUser.authId

    if (category == 1) {
      ;(filterarr = 'weightarr'),
        (userweightType = 'userweightType'),
        (displayweightType = 'userweightType'),
        (filtertext = 'userweight'),
        (displaytext = 'weight'),
        (previous = 0)
    }
    if (category == 2) {
      ;(filterarr = 'bodyfatarr'),
        (filtertext = 'userbodyfat'),
        (displaytext = 'bodyfat'),
        (previous = 0)
    }
    if (category == 3) {
      ;(filterarr = 'bmrarr'),
        (filtertext = 'userbmr'),
        (displaytext = 'bmr'),
        (previous = 0)
    }
    if (category == 4) {
      ;(filterarr = 'lbmarr'),
        (filtertext = 'userlbm'),
        (displaytext = 'lbm'),
        (previous = 0)
    }

    //1 month (past 1 month data starting from current day) NEW filters
    if (newfilterType == 1) {
      var startOfMonth = moment().subtract(30, 'days').format('YYYY-MM-DD')
      var endOfMonth = moment().format('YYYY-MM-DD')
      var start = new Date(startOfMonth)
      var end = new Date(new Date(endOfMonth).setUTCHours(23, 59, 59, 999))
      var groupby = 'day'
      let filterval = filterarr + '.date'
      filter = {
        $and: [
          { user_id: mongoose.Types.ObjectId(userId) },
          { [filterval]: { $gte: new Date(start), $lte: new Date(end) } },
        ],
      }
    }

    //3 months ((past 3 months data starting from current month))
    if (newfilterType == 2) {
      var startOfMonth = moment()
        .subtract(2, 'month')
        .startOf('month')
        .format('YYYY-MM-DD')
      var endOfMonth = moment()
        .subtract(0, 'month')
        .endOf('month')
        .format('YYYY-MM-DD')
      var start = new Date(startOfMonth)
      var end = new Date(new Date(endOfMonth).setUTCHours(23, 59, 59, 999))
      var groupby = 'day'
      let filterval = filterarr + '.date'
      filter = {
        $and: [
          { user_id: mongoose.Types.ObjectId(userId) },
          { [filterval]: { $gte: new Date(start), $lte: new Date(end) } },
        ],
      }
    }

    //6 months (past 6 months data starting from current month)
    if (newfilterType == 3) {
      var startOfMonth = moment()
        .subtract(5, 'month')
        .startOf('month')
        .format('YYYY-MM-DD')
      var endOfMonth = moment()
        .subtract(0, 'month')
        .endOf('month')
        .format('YYYY-MM-DD')
      var start = new Date(startOfMonth)
      var end = new Date(new Date(endOfMonth).setUTCHours(23, 59, 59, 999))
      var groupby = 'day'
      let filterval = filterarr + '.date'
      filter = {
        $and: [
          { user_id: mongoose.Types.ObjectId(userId) },
          { [filterval]: { $gte: new Date(start), $lte: new Date(end) } },
        ],
      }
    }
    //12 months (past 12 months data starting from current month)
    if (newfilterType == 4) {
      var startOfMonth = moment()
        .subtract(11, 'month')
        .startOf('month')
        .format('YYYY-MM-DD')
      var endOfMonth = moment()
        .subtract(0, 'month')
        .endOf('month')
        .format('YYYY-MM-DD')
      var start = new Date(startOfMonth)
      var end = new Date(new Date(endOfMonth).setUTCHours(23, 59, 59, 999))
      var groupby = 'day'
      let filterval = filterarr + '.date'
      filter = {
        $and: [
          { user_id: mongoose.Types.ObjectId(userId) },
          { [filterval]: { $gte: new Date(start), $lte: new Date(end) } },
        ],
      }
    }

    var dtrange = daterange.range(start, end)
    // console.log(dtrange)
    let GroupBy
    let SortBy
    let Project
    let Xarray
    let finalresult = []

    if (groupby == 'week') {
      GroupBy = {
        week: { $week: '$' + filterarr + '.date' },
        year: { $year: '$' + filterarr + '.date' },
      }

      SortBy = { '_id.year': 1, '_id.week': 1 }
      Project = {
        totalcount: 1,
        week: '$_id.week',
        year: '$_id.year',
        _id: 0,
        data: 1,
      }
      Xarray = Array.from(dtrange.by('weeks'))

      let aggregateArr = [
        { $unwind: '$' + filterarr },
        { $match: filter },
        {
          $group: {
            _id: GroupBy,
            totalcount: { $sum: 1 },
            data: {
              $push: {
                [filtertext]: '$' + filterarr + '.' + filtertext,
                userweightType: '$' + filterarr + '.' + userweightType,
              },
            },
          },
        },
        { $sort: SortBy },
        {
          $project: Project,
        },
      ]

      let result = await query.aggregate(useranalyticscoll, aggregateArr)
      if (result.length == 0) {
        return responseModel.failResponse('No Data Found of user activity!')
      }
      //console.log("Xarray.length",Xarray.length);
      if (Xarray && Xarray.length > 0) {
        let X = Xarray.map((m) => {
          return m.format('YYYY-MM-DD')
        })

        _.map(X, function (obj) {
          let Week = moment(obj).week()
          let Year = moment(obj).year()
          let dayObj = _.find(result, { week: Week - 1, year: Year })

          if (dayObj != undefined) {
            if (dayObj.data.length > 0) {
              var arr = dayObj.data
              //console.log("arr",arr);
              var ratearray = _.map(arr, filtertext)
              //console.log("ratearray",ratearray);
              var totalrate = _.size(ratearray)
              var ratecount = _.sum(ratearray)

              if (totalrate == 0 && ratecount == 0) {
                var avg = 0
              } else {
                var temp = ratecount / totalrate
                var avg = Math.round(temp)
              }
            }
          }

          // if(dayObj != undefined ){
          //   if(dayObj.data[0][filtertext] != undefined){
          //     previous = dayObj.data[0][filtertext]
          //     console.log("previous",previous);
          //     console.log("--",dayObj.data[0][filtertext]);
          //   }
          // }

          finalresult.push({
            [displaytext]: dayObj && dayObj.data && avg ? avg : 0,
            // [displaytext] : dayObj && dayObj.data && dayObj.data[0][filtertext] ? dayObj.data[0][filtertext] : previous,
            week: moment()
              .year(Year)
              .week(Week)
              .day('sunday')
              .format('YYYY-MM-DD'),
          })
        })
      }
    }

    if (groupby == 'day') {
      GroupBy = {
        [displaytext]: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$' + filterarr + '.date',
          },
        },
      }

      SortBy = { ['_id.' + displaytext]: -1 }

      Project = {
        totalcount: 1,
        [displaytext]: '$_id.' + displaytext,
        _id: 0,
        data: 1,
      }

      Xarray = Array.from(dtrange.by('days'))
      //  console.log(Xarray)
      let aggregateArr = [
        { $unwind: '$' + filterarr },
        { $match: filter },
        {
          $group: {
            _id: GroupBy,
            totalcount: { $sum: 1 },
            data: {
              $push: {
                [filtertext]: '$' + filterarr + '.' + filtertext,
                [userweightType]: '$' + filterarr + '.' + userweightType,
              },
            },
          }, // userweight : $weighrtarr.userweight
        },
        { $sort: SortBy },
        {
          $project: Project,
        },
      ]

      let totalresult = await query.aggregate(useranalyticscoll, aggregateArr)

      aggregateArr.push({ $skip: skip }, { $limit: limit })

      let result = await query.aggregate(useranalyticscoll, aggregateArr)
      var resultCount = result.length

      if (result.length == 0) {
        return responseModel.failResponse('No Data Found of user activity!')
      }

      var total = totalresult.length

      var totalPages = Math.ceil(totalresult.length / limit)

      for (let i = 0; i < result.length; i++) {
        var element = result[i]
        var obj = {
          [displaytext]: element.data[0][filtertext],
          [displayweightType]: element.data[0][userweightType],
          day: element[displaytext],
        }
        finalresult.push(obj)
      }
    }

    function compare(a, b) {
      // Use toUpperCase() to ignore character casing
      const bandA = a.day.toUpperCase()
      const bandB = b.day.toUpperCase()
      // console.log(bandA)
      // console.log(bandB)
      let comparison = 0
      if (bandA > bandB) {
        comparison = 1
      } else if (bandA < bandB) {
        comparison = -1
      }
      return comparison
    }

    var sortResultAsc = finalresult.sort(compare)
    console.log(sortResultAsc)
    return responseModel.successResponse('user activity graph', {
      graphdata: sortResultAsc,
      totalRecord: total,
      totalPages: resultCount > 0 ? totalPages : 0,
    })
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while generating graph: ' + errMessage
    )
  }
}

exports.useractivityold = async function (req) {
  try {
    var category = req.body.category //1 - weight ,2 - bodyfat ,3 - bmr , 4 - lbm
    var filterType = req.body.filterType
    var filterarr
    var filtertext
    var displaytext
    let user = await query.findOne(collection, {
      _id: req.authenticationUser.authId,
    })

    if (category == 1) {
      ;(filterarr = 'weightarr'),
        (filtertext = 'userweight'),
        (displaytext = 'Weight')
    }
    if (category == 2) {
      ;(filterarr = 'bodyfatarr'),
        (filtertext = 'userbodyfat'),
        (displaytext = 'Bodyfat')
    }
    if (category == 3) {
      ;(filterarr = 'bmrarr'), (filtertext = 'userbmr'), (displaytext = 'BMR')
    }
    if (category == 4) {
      ;(filterarr = 'lbmarr'), (filtertext = 'userlbm'), (displaytext = 'LBM')
    }

    if (filterType == 1) {
      // lastWeek
      var startOfWeek = moment()
        .subtract(1, 'weeks')
        .startOf('week')
        .format('YYYY-MM-DD')
      var endOfWeek = moment()
        .subtract(1, 'weeks')
        .endOf('week')
        .format('YYYY-MM-DD')
      var start = new Date(startOfWeek)
      var end = new Date(new Date(endOfWeek).setUTCHours(23, 59, 59, 999))
      // console.log("start--",start);
      // console.log("end--",end);
      var groupby = 'day'
    }

    if (filterType == 2) {
      // lastMonth
      var startOfMonth = moment()
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DD')
      var endOfMonth = moment()
        .subtract(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DD')
      var start = new Date(startOfMonth)
      var end = new Date(new Date(endOfMonth).setUTCHours(23, 59, 59, 999))
      // console.log("start--",start);
      // console.log("end--",end);
      var groupby = 'week'
    }

    if (filterType == 3) {
      // Custom Date
      var start = req.body.startdate
      var end = req.body.enddate
      // console.log("start--",start);
      // console.log("end--",end);
      var groupby = 'date'
    }

    let filterval = filterarr + '.date'

    let filter = {
      $and: [
        { _id: mongoose.Types.ObjectId(req.authenticationUser.authId) },
        { 'bodyfatarr.date': { $gte: new Date(start), $lte: new Date(end) } },
        { 'weightarr.date': { $gte: new Date(start), $lte: new Date(end) } },
        { 'bmrarr.date': { $gte: new Date(start), $lte: new Date(end) } },
        { 'lbmarr.date': { $gte: new Date(start), $lte: new Date(end) } },
      ],
    }

    //console.log(filter);

    var dtrange = daterange.range(start, end)

    let GroupBy
    let SortBy
    let Project
    let Xarray
    let finalresult = []
    //console.log("groupby=>>",);

    if (groupby == 'week' && groupby == 'date') {
      GroupBy = {
        week: { $week: '$weightarr.date' },
        year: { $year: '$weightarr.date' },
        bweek: { $week: '$bodyfatarr.date' },
        byear: { $year: '$bodyfatarr.date' },
        bmweek: { $week: '$bmrarr.date' },
        bmyear: { $year: '$bmrarr.date' },
        lweek: { $week: '$lbmarr.date' },
        lyear: { $year: '$lbmarr.date' },
      }

      SortBy = {
        '_id.year': 1,
        '_id.week': 1,
        '_id.bweek': 1,
        '_id.byear': 1,
        '_id.bmweek': 1,
        '_id.bmyear': 1,
        '_id.lweek': 1,
        '_id.lyear': 1,
      }
      Project = {
        totalcount: 1,
        week: '$_id.week',
        year: '$_id.year',
        bweek: '$_id.bweek',
        byear: '$_id.byear',
        bmweek: '$_id.bmweek',
        bmyear: '$_id.bmyear',
        lweek: '$_id.lweek',
        lyear: '$_id.lyear',
        _id: 0,
        data: 1,
      }
      Xarray = Array.from(dtrange.by('weeks'))

      let aggregateArr = [
        { $unwind: '$weightarr' },
        { $unwind: '$bodyfatarr' },
        { $unwind: '$bmrarr' },
        { $unwind: '$lbmarr' },
        { $match: filter },
        {
          $group: {
            _id: GroupBy,
            totalcount: { $sum: 1 },
            data: {
              $push: {
                userweight: '$weightarr.userweight',
                userbodyfat: '$bodyfatarr.userbodyfat',
                userbmr: '$bmrarr.userbmr',
                userlbm: '$lbmarr.userlbm',
              },
            },
          },
        },
        { $sort: SortBy },
        {
          $project: Project,
        },
      ]

      let result = await query.aggregate(collection, aggregateArr)
      //let result = await collection.aggregate(aggregateArr).allowDiskUse(true).exec();
      if (result.length == 0) {
        return responseModel.failResponse('No Data Found of user activity!')
      }

      if (Xarray && Xarray.length > 0) {
        let X = Xarray.map((m) => {
          return m.format('YYYY-MM-DD')
        })

        var wprevious
        var bprevious
        var bmrprevious
        var lbmprevious

        _.map(X, function (obj) {
          let Week = moment(obj).week()
          let Year = moment(obj).year()
          let BWeek = moment(obj).week()
          let BYear = moment(obj).year()
          let BmrWeek = moment(obj).week()
          let BmrYear = moment(obj).year()
          let lbmWeek = moment(obj).week()
          let lbmYear = moment(obj).year()
          let dayObj = _.find(result, { week: Week - 1, year: Year })
          let BdayObj = _.find(result, { bweek: BWeek - 1, byear: BYear })
          let BmrdayObj = _.find(result, {
            bmweek: BmrWeek - 1,
            bmyear: BmrYear,
          })
          let lbmdayObj = _.find(result, { lweek: lbmWeek - 1, lyear: lbmYear })

          if (dayObj != undefined) {
            if (dayObj.data[0].userweight != undefined) {
              wprevious = dayObj.data[0].userweight
            }
          }
          if (BdayObj != undefined) {
            if (BdayObj.data[0].userbodyfat != undefined) {
              bprevious = BdayObj.data[0].userbodyfat
            }
          }
          if (BmrdayObj != undefined) {
            if (BmrdayObj.data[0].userbmr != undefined) {
              bmrprevious = BmrdayObj.data[0].userbmr
            }
          }
          if (lbmdayObj != undefined) {
            if (lbmdayObj.data[0].userlbm != undefined) {
              lbmprevious = lbmdayObj.data[0].userlbm
            }
          }

          if (groupby == 'date') {
            finalresult.push({
              // totalcount: dayObj && dayObj.totalcount ? dayObj.totalcount : 0,
              weight:
                dayObj && dayObj.data && dayObj.data[0].userweight
                  ? dayObj.data[0].userweight
                  : wprevious,
              bodyfat:
                BdayObj && BdayObj.data && BdayObj.data[0].userbodyfat
                  ? BdayObj.data[0].userbodyfat
                  : bprevious,
              bmr:
                BmrdayObj && BmrdayObj.data && BmrdayObj.data[0].userbmr
                  ? BmrdayObj.data[0].userbmr
                  : bmrprevious,
              lbm:
                lbmdayObj && lbmdayObj.data && lbmdayObj.data[0].userlbm
                  ? lbmdayObj.data[0].userlbm
                  : lbmprevious,
              date: moment()
                .year(Year)
                .week(Week)
                .day('sunday')
                .format('YYYY-MM-DD'),
            })
          } else {
            finalresult.push({
              // totalcount: dayObj && dayObj.totalcount ? dayObj.totalcount : 0,
              weight:
                dayObj && dayObj.data && dayObj.data[0].userweight
                  ? dayObj.data[0].userweight
                  : wprevious,
              bodyfat:
                BdayObj && BdayObj.data && BdayObj.data[0].userbodyfat
                  ? BdayObj.data[0].userbodyfat
                  : bprevious,
              bmr:
                BmrdayObj && BmrdayObj.data && BmrdayObj.data[0].userbmr
                  ? BmrdayObj.data[0].userbmr
                  : bmrprevious,
              lbm:
                lbmdayObj && lbmdayObj.data && lbmdayObj.data[0].userlbm
                  ? lbmdayObj.data[0].userlbm
                  : lbmprevious,
              week: moment()
                .year(Year)
                .week(Week)
                .day('sunday')
                .format('YYYY-MM-DD'),
            })
          }
        })
      }
    }

    if (groupby == 'day') {
      GroupBy = {
        weight: {
          $dateToString: { format: '%Y-%m-%d', date: '$weightarr.date' },
        },
        bodyfat: {
          $dateToString: { format: '%Y-%m-%d', date: '$bodyfatarr.date' },
        },
        bmr: { $dateToString: { format: '%Y-%m-%d', date: '$bmrarr.date' } },
        lbm: { $dateToString: { format: '%Y-%m-%d', date: '$lbmarr.date' } },
      }

      SortBy = { '_id.weight': 1, '_id.bodyfat': 1, '_id.bmr': 1, '_id.lbm': 1 }

      Project = {
        totalcount: 1,
        weight: '$_id.weight',
        bodyfat: '$_id.bodyfat',
        bmr: '$_id.bmr',
        lbm: '$_id.lbm',
        _id: 0,
        data: 1,
      }

      Xarray = Array.from(dtrange.by('days'))

      let aggregateArr = [
        { $unwind: '$weightarr' },
        { $unwind: '$bodyfatarr' },
        { $unwind: '$bmrarr' },
        { $unwind: '$lbmarr' },
        { $match: filter },
        {
          $group: {
            _id: GroupBy,
            totalcount: { $sum: 1 },
            data: {
              $push: {
                userweight: '$weightarr.userweight',
                userbodyfat: '$bodyfatarr.userbodyfat',
                userbmr: '$bmrarr.userbmr',
                userlbm: '$lbmarr.userlbm',
              },
            },
          },
        },
        { $sort: SortBy },
        {
          $project: Project,
        },
      ]

      let result = await query.aggregate(collection, aggregateArr)
      // let result = collection.aggregate(aggregateArr).allowDiskUse(true).exec();
      if (result.length == 0) {
        return responseModel.failResponse('No Data Found of user activity!')
      }

      if (Xarray && Xarray.length > 0) {
        let X = Xarray.map((m) => {
          return m.format('YYYY-MM-DD')
        })

        var wprevious
        var bprevious
        var bmrprevious
        var lbmprevious

        _.map(X, function (obj) {
          let wdayObj = _.find(result, { weight: obj })
          let bodydayObj = _.find(result, { bodyfat: obj })
          let bmrdayObj = _.find(result, { bmr: obj })
          let lbmdayObj = _.find(result, { lbm: obj })

          if (wdayObj != undefined) {
            if (wdayObj.data[0].userweight != undefined) {
              wprevious = wdayObj.data[0].userweight
            }
          }
          if (bodydayObj != undefined) {
            if (bodydayObj.data[0].userbodyfat != undefined) {
              bprevious = bodydayObj.data[0].userbodyfat
            }
          }
          if (bmrdayObj != undefined) {
            if (bmrdayObj.data[0].userbmr != undefined) {
              bmrprevious = bmrdayObj.data[0].userbmr
            }
          }
          if (lbmdayObj != undefined) {
            if (lbmdayObj.data[0].userlbm != undefined) {
              lbmprevious = lbmdayObj.data[0].userlbm
            }
          }

          finalresult.push({
            // totalcount: dayObj && dayObj.totalcount ? dayObj.totalcount : 0,
            weight:
              wdayObj && wdayObj.data && wdayObj.data[0].userweight
                ? wdayObj.data[0].userweight
                : wprevious,
            bodyfat:
              bodydayObj && bodydayObj.data && bodydayObj.data[0].userbodyfat
                ? bodydayObj.data[0].userbodyfat
                : bprevious,
            bmr:
              bmrdayObj && bmrdayObj.data && bmrdayObj.data[0].userbmr
                ? bmrdayObj.data[0].userbmr
                : bmrprevious,
            lbm:
              lbmdayObj && lbmdayObj.data && lbmdayObj.data[0].userlbm
                ? lbmdayObj.data[0].userlbm
                : lbmprevious,
            day: obj,
          })
        })
      }
    }

    return responseModel.successResponse('user activity graph', finalresult)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while generating graph: ' + errMessage
    )
  }
}

exports.userCurrentStatus = async function (req) {
  try {
    var userId = req.authenticationUser.authId
    let user = await query.findOne(collection, { _id: userId })

    var limit = 1
    var Arr = [
      { $match: { user_id: mongoose.Types.ObjectId(userId) } },
      { $sort: { _id: -1 } },
      { $limit: limit },
    ]
    var lastCollection = await query.aggregate(userphotocoll, Arr)
    //console.log("lastCollection",lastCollection.length);
    if (lastCollection.length > 0) {
      var userdata = {
        weight: lastCollection[0].userweight
          ? lastCollection[0].userweight
          : 0.0,
        weightType: lastCollection[0].userweightType
          ? lastCollection[0].userweightType
          : 2,
        bodyfat: lastCollection[0].userbodyfat
          ? lastCollection[0].userbodyfat
          : 0.0,
        lbm: lastCollection[0].userlbm ? lastCollection[0].userlbm : 0.0,
        bmr: lastCollection[0].userbmr ? lastCollection[0].userbmr : 0.0,
      }
    } else {
      var userdata = {
        weight: 0.0,
        weightType: 2,
        bodyfat: 0.0,
        lbm: 0.0,
        bmr: 0.0,
      }
    }

    return responseModel.successResponse(
      'user weigh, bodyfat, lbm & bmr get successfully',
      userdata
    )
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while getting user weigh, bodyfat, lbm & bmr: ' + errMessage
    )
  }
}

exports.user_reminder = async function (req) {
  try {
    let user = await query.find(collection, {
      isNotification: true,
      isActive: true,
    })

    for (let i = 0; i < user.length; i++) {
      var device_token = user[i].device_token
      var message =
        'Hey ' +
        user[i].name +
        ", it's time to weigh in. Please enter your current weight and body fat."
      var title = 'Meal Plan'
      var type = '1'

      UserService.pushNotification(device_token, message, title, type)
    }

    //console.log("notification send sucessfully..");
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    //console.log("error--",errMessage);
  }
}

exports.groceriePdfGenerate = async function (req) {
  try {
    var userId = req.authenticationUser.authId
    var todayDate = new Date(new Date().setUTCHours(0, 0, 0, 0))
    //var mealdate = req.body.date;
    var user = await query.findOne(collection, { _id: userId })
    var usermealplan = await query.findOne(usermealcoll, {
      $and: [{ user_id: userId }, { mealplandate: todayDate }],
    })

    if (usermealplan) {
      var mealplanarr = usermealplan.mealplan
      let doc = new PDFDocument({ size: 'A4', margin: 20 })

      await generateHeader2(doc, user)
      await generateGrocerie(doc, mealplanarr)
      await generateFooter2(doc)

      doc.end()

      // var Prefix = userId;
      // const MaxKeys = 1; // If a single object is found, the folder exists.
      // const params = { MealplanPdfBucket, Prefix, MaxKeys };
      // var fileName = userId+'/'+userId+'-'+timestamp+'-mealplanpdf';

      var fileName = userId + '-grocerie'

      var params = {
        Key: fileName,
        ACL: 'public-read',
        Body: doc,
        Bucket: MealplanGorBucket,
        ContentType: 'application/pdf',
      }

      const s3Response = await s3.upload(params).promise()
      console.log('s3Response', s3Response)
      if (s3Response) {
        var pdfurl = s3Response.Location
        console.log(updateUrl)
        var updateUrl = await query.findOneAndUpdate(
          collection,
          { _id: userId },
          { $set: { groceriePdfUrl: pdfurl } }
        )
        return responseModel.successResponse(
          'Your Grocerie Pdf generated successfully.',
          pdfurl
        )
      }
    } else {
      return responseModel.successResponse("user don't have any meal plan")
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while generating Grocerie Pdf: ' + errMessage
    )
  }
}

async function generateHeader2(doc, user, waterintake) {
  var icon = ''
  let iconBuffer = await doRequest(icon)

  doc
    .image(iconBuffer, 260, 50, {
      align: 'center',
      valign: 'center',
      width: 80,
    })
    .fontSize(20)
    .text('MEAL ID', 20, 135, { align: 'center' })
    .font('./public/Roboto/Roboto-Regular.ttf')
    .moveDown()
}

function generateGrocerie(doc, mealplanarr) {
  var space = 150

  for (let i = 0; i < 1; i++) {
    var mealarr = mealplanarr

    doc.fontSize(13).text('Your Groceries List For Today ', 50, space + 10, {
      align: 'center',
    }) //"Meal Plan "+ [i+1]

    for (let j = 0; j < mealarr.length; j++) {
      const element = mealarr[j]
      doc
      generateHr(doc, space + 55)
      doc
        .fontSize(11)
        .text('Meal ' + [j + 1], 20, space + 60, { align: 'center' })
        .fontSize(12)
        .text(
          'Calorie Food : ' +
            element[0].calories.grocery_list_name +
            ' (' +
            element[0].calories.size +
            ')',
          60,
          space + 75
        )
        .fontSize(12)
        .text(
          'Carb Food : ' +
            element[1].carbs.grocery_list_name +
            ' (' +
            element[1].carbs.size +
            ')',
          60,
          space + 90
        )
        .fontSize(12)
        .text(
          'Protein Food : ' +
            element[2].proteins.grocery_list_name +
            ' (' +
            element[2].proteins.size +
            ')',
          60,
          space + 105
        )
        .fontSize(12)
        .text(
          'Fat Food : ' +
            element[3].fats.grocery_list_name +
            ' (' +
            element[3].fats.size +
            ')',
          60,
          space + 120
        )

      mealspace = 85
      space = space + mealspace
    }
  }
}

function generateFooter2(doc) {
  doc
    // .image("./public/mealid_icon.png", 270,700, { align: 'center', valign: 'center', width: 50 })
    .font('./public/Roboto/Roboto-Regular.ttf')
    .fontSize(15)
    .text('Thank you for using Meal ID.', 50, 750, {
      align: 'center',
      width: 500,
    })
}

exports.replacefood = async function (req) {
  try {
    var food = await query.find(mealcoll, {})
    //console.log(food.length);
    for (let i = 0; i < food.length; i++) {
      var element = food[i]
      var foodname = element.image_name
      var foodid = element._id
      const search = ''
      const replaceWith = ''
      const result = foodname.split(search).join(replaceWith)

      //console.log(result);

      var update = await query.findOneAndUpdate(
        mealcoll,
        { _id: foodid },
        { image_name: result }
      )
    }

    return responseModel.successResponse('replaced')
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse('Error while : ' + errMessage)
  }
}

exports.replaceMealPlan = async function (req) {
  try {
    var mainArr = []
    const search = ''
    const replaceWith = '='
    var usermealplan = await query.find(usermealcoll, {})
    // console.log(usermealplan.length);
    for (let i = 0; i < usermealplan.length; i++) {
      var mealplanarr = usermealplan[i].mealplan
      var mealplanId = usermealplan[i]._id

      for (let j = 0; j < mealplanarr.length; j++) {
        var element = mealplanarr[j]
        // console.log("element before",element[0].calories.image_name);
        var foodurl1 = element[0].calories.image_name
        var foodurl2 = element[1].carbs.image_name
        var foodurl3 = element[2].proteins.image_name
        var foodurl4 = element[3].fats.image_name
        var foodres1 = foodurl1.split(search).join(replaceWith)
        var foodres2 = foodurl2.split(search).join(replaceWith)
        var foodres3 = foodurl3.split(search).join(replaceWith)
        var foodres4 = foodurl4.split(search).join(replaceWith)

        element[0].calories.image_name = foodres1
        element[1].carbs.image_name = foodres2
        element[2].proteins.image_name = foodres3
        element[3].fats.image_name = foodres4

        // console.log("element after",element[0].calories.image_name);
        mainArr.push(element)
      }

      var update = await query.findOneAndUpdate(
        usermealcoll,
        { _id: mealplanId },
        { mealplan: mainArr }
      )
    }

    return responseModel.successResponse('replaced')
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse('Error while : ' + errMessage)
  }
}

exports.replaceUserImage = async function (req) {
  try {
    var user = await query.find(collection, {})
    var photoArr = []
    for (let i = 0; i < 1; i++) {
      var singleUser = user[i]
      var userId = user[i]._id
      var photoArr = singleUser.userphoto
      // console.log("---",photoArr.length);
      if (photoArr.length > 0) {
        for (let k = 0; k < photoArr.length; k++) {
          var photo = photoArr[k]
          var photourl = photo.photourl
          //console.log("before",photourl);
          const search = 'http://localhost:9000'
          const replaceWith = ''
          var result = photourl.split(search).join(replaceWith)
          //console.log("res",result);
          photo.photourl = result

          photoArr.push(photo)
        }

        var update = await query.findOneAndUpdate(
          collection,
          { _id: userId },
          { userphoto: photoArr }
        )
      }
    }

    return responseModel.successResponse('replaced')
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse('Error while : ' + errMessage)
  }
}

async function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode == 200) {
        resolve(body)
      } else {
        reject(error)
      }
    })
  })
}

exports.updateAppVersion = async function (req) {
  try {
    var data = {
      ios: req.body.ios,
      android: req.body.android,
      updateAt: Date.now(),
    }
    //console.log(data);

    let user = await query.update(appversioncoll, {}, data)
    return responseModel.successResponse('App version Updated', user)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user weigh and bodyfat: ' + errMessage
    )
  }
}

exports.getAppVersion = async function (req) {
  try {
    let data = await query.findOne(appversioncoll, {})
    return responseModel.successResponse('App version get sucessfully', data)
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      'Error while updating user weigh and bodyfat: ' + errMessage
    )
  }
}

exports.swapMealFoodV2 = async function (req) {
  console.log('req', req.body)
  const { addMealToRecent } = require('./meal')
  try {
    var usermealId = req.body.usermealId
    var foodId = req.body.foodId
    var mealno = req.body.mealno
    var diettype = req.body.diettype
    var foodposition = req.body.foodposition
    var filterCategory
    var MealFood = await query.findOne(usermealcoll, { _id: usermealId })
    var food = await query.findOne(mealcoll, { _id: foodId })
    if (food) {
      console.log('food._id', food._id)
      console.log('addMealToRecent', addMealToRecent)
      await addMealToRecent(food._id, req.authenticationUser.authId)

      var mealname = food.grocery_list_name
      var meal = food
      var foodCategory = food.category
      var foodCal = food.cal
      var foodProt = food.prot
      var foodCarb = food.carbs
      var foodFat = food.fats
      var mealVal
      var mealCat

      // var meal = await UserService.swapmeal(dietfilter, mealVal, mealCat, foodId, foodName, foodCategory);

      if (mealno == 1) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal10 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[0][1].carbs.cal +
            MealFood.mealplan[0][2].proteins.cal +
            MealFood.mealplan[0][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[0][1].carbs.carbs +
            MealFood.mealplan[0][2].proteins.carbs +
            MealFood.mealplan[0][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[0][1].carbs.prot +
            MealFood.mealplan[0][2].proteins.prot +
            MealFood.mealplan[0][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[0][1].carbs.fats +
            MealFood.mealplan[0][2].proteins.fats +
            MealFood.mealplan[0][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[0][0].calories = meal
          MealFood.mealplan[0][4].total.totalCal = totalCal
          MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[0][4].total.totalProt = totalProt
          MealFood.mealplan[0][4].total.totalFats = totalFats
          MealFood.mealplan[0][4].total.CarboPer = CarboPer
          MealFood.mealplan[0][4].total.ProtPer = ProtPer
          MealFood.mealplan[0][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal11 : mealname }});
          var totalCal =
            MealFood.mealplan[0][0].calories.cal +
            meal.cal +
            MealFood.mealplan[0][2].proteins.cal +
            MealFood.mealplan[0][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[0][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[0][2].proteins.carbs +
            MealFood.mealplan[0][3].fats.carbs
          var totalProt =
            MealFood.mealplan[0][0].calories.prot +
            meal.prot +
            MealFood.mealplan[0][2].proteins.prot +
            MealFood.mealplan[0][3].fats.prot
          var totalFats =
            MealFood.mealplan[0][0].calories.fats +
            meal.fats +
            MealFood.mealplan[0][2].proteins.fats +
            MealFood.mealplan[0][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[0][1].carbs = meal
          MealFood.mealplan[0][4].total.totalCal = totalCal
          MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[0][4].total.totalProt = totalProt
          MealFood.mealplan[0][4].total.totalFats = totalFats
          MealFood.mealplan[0][4].total.CarboPer = CarboPer
          MealFood.mealplan[0][4].total.ProtPer = ProtPer
          MealFood.mealplan[0][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal12 : mealname }});
          var totalCal =
            MealFood.mealplan[0][0].calories.cal +
            MealFood.mealplan[0][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[0][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[0][0].calories.carbs +
            MealFood.mealplan[0][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[0][3].fats.carbs
          var totalProt =
            MealFood.mealplan[0][0].calories.prot +
            MealFood.mealplan[0][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[0][3].fats.prot
          var totalFats =
            MealFood.mealplan[0][0].calories.fats +
            MealFood.mealplan[0][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[0][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[0][2].proteins = meal
          MealFood.mealplan[0][4].total.totalCal = totalCal
          MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[0][4].total.totalProt = totalProt
          MealFood.mealplan[0][4].total.totalFats = totalFats
          MealFood.mealplan[0][4].total.CarboPer = CarboPer
          MealFood.mealplan[0][4].total.ProtPer = ProtPer
          MealFood.mealplan[0][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal13 : mealname }});
          var totalCal =
            MealFood.mealplan[0][0].calories.cal +
            MealFood.mealplan[0][1].carbs.cal +
            MealFood.mealplan[0][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[0][0].calories.carbs +
            MealFood.mealplan[0][1].carbs.carbs +
            MealFood.mealplan[0][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[0][0].calories.prot +
            MealFood.mealplan[0][1].carbs.prot +
            MealFood.mealplan[0][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[0][0].calories.fats +
            MealFood.mealplan[0][1].carbs.fats +
            MealFood.mealplan[0][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[0][3].fats = meal
          MealFood.mealplan[0][4].total.totalCal = totalCal
          MealFood.mealplan[0][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[0][4].total.totalProt = totalProt
          MealFood.mealplan[0][4].total.totalFats = totalFats
          MealFood.mealplan[0][4].total.CarboPer = CarboPer
          MealFood.mealplan[0][4].total.ProtPer = ProtPer
          MealFood.mealplan[0][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 2) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal20 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[1][1].carbs.cal +
            MealFood.mealplan[1][2].proteins.cal +
            MealFood.mealplan[1][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[1][1].carbs.carbs +
            MealFood.mealplan[1][2].proteins.carbs +
            MealFood.mealplan[1][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[1][1].carbs.prot +
            MealFood.mealplan[1][2].proteins.prot +
            MealFood.mealplan[1][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[1][1].carbs.fats +
            MealFood.mealplan[1][2].proteins.fats +
            MealFood.mealplan[1][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[1][0].calories = meal
          MealFood.mealplan[1][4].total.totalCal = totalCal
          MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[1][4].total.totalProt = totalProt
          MealFood.mealplan[1][4].total.totalFats = totalFats
          MealFood.mealplan[1][4].total.CarboPer = CarboPer
          MealFood.mealplan[1][4].total.ProtPer = ProtPer
          MealFood.mealplan[1][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal21 : mealname }});
          var totalCal =
            MealFood.mealplan[1][0].calories.cal +
            meal.cal +
            MealFood.mealplan[1][2].proteins.cal +
            MealFood.mealplan[1][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[1][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[1][2].proteins.carbs +
            MealFood.mealplan[1][3].fats.carbs
          var totalProt =
            MealFood.mealplan[1][0].calories.prot +
            meal.prot +
            MealFood.mealplan[1][2].proteins.prot +
            MealFood.mealplan[1][3].fats.prot
          var totalFats =
            MealFood.mealplan[1][0].calories.fats +
            meal.fats +
            MealFood.mealplan[1][2].proteins.fats +
            MealFood.mealplan[1][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[1][1].carbs = meal
          MealFood.mealplan[1][4].total.totalCal = totalCal
          MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[1][4].total.totalProt = totalProt
          MealFood.mealplan[1][4].total.totalFats = totalFats
          MealFood.mealplan[1][4].total.CarboPer = CarboPer
          MealFood.mealplan[1][4].total.ProtPer = ProtPer
          MealFood.mealplan[1][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal22 : mealname }});
          var totalCal =
            MealFood.mealplan[1][0].calories.cal +
            MealFood.mealplan[1][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[1][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[1][0].calories.carbs +
            MealFood.mealplan[1][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[1][3].fats.carbs
          var totalProt =
            MealFood.mealplan[1][0].calories.prot +
            MealFood.mealplan[1][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[1][3].fats.prot
          var totalFats =
            MealFood.mealplan[1][0].calories.fats +
            MealFood.mealplan[1][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[1][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[1][2].proteins = meal
          MealFood.mealplan[1][4].total.totalCal = totalCal
          MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[1][4].total.totalProt = totalProt
          MealFood.mealplan[1][4].total.totalFats = totalFats
          MealFood.mealplan[1][4].total.CarboPer = CarboPer
          MealFood.mealplan[1][4].total.ProtPer = ProtPer
          MealFood.mealplan[1][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal23 : mealname }});
          var totalCal =
            MealFood.mealplan[1][0].calories.cal +
            MealFood.mealplan[1][1].carbs.cal +
            MealFood.mealplan[1][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[1][0].calories.carbs +
            MealFood.mealplan[1][1].carbs.carbs +
            MealFood.mealplan[1][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[1][0].calories.prot +
            MealFood.mealplan[1][1].carbs.prot +
            MealFood.mealplan[1][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[1][0].calories.fats +
            MealFood.mealplan[1][1].carbs.fats +
            MealFood.mealplan[1][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[1][3].fats = meal
          MealFood.mealplan[1][4].total.totalCal = totalCal
          MealFood.mealplan[1][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[1][4].total.totalProt = totalProt
          MealFood.mealplan[1][4].total.totalFats = totalFats
          MealFood.mealplan[1][4].total.CarboPer = CarboPer
          MealFood.mealplan[1][4].total.ProtPer = ProtPer
          MealFood.mealplan[1][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 3) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal30 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[2][1].carbs.cal +
            MealFood.mealplan[2][2].proteins.cal +
            MealFood.mealplan[2][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[2][1].carbs.carbs +
            MealFood.mealplan[2][2].proteins.carbs +
            MealFood.mealplan[2][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[2][1].carbs.prot +
            MealFood.mealplan[2][2].proteins.prot +
            MealFood.mealplan[2][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[2][1].carbs.fats +
            MealFood.mealplan[2][2].proteins.fats +
            MealFood.mealplan[2][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[2][0].calories = meal
          MealFood.mealplan[2][4].total.totalCal = totalCal
          MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[2][4].total.totalProt = totalProt
          MealFood.mealplan[2][4].total.totalFats = totalFats
          MealFood.mealplan[2][4].total.CarboPer = CarboPer
          MealFood.mealplan[2][4].total.ProtPer = ProtPer
          MealFood.mealplan[2][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal31 : mealname }});
          var totalCal =
            MealFood.mealplan[2][0].calories.cal +
            meal.cal +
            MealFood.mealplan[2][2].proteins.cal +
            MealFood.mealplan[2][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[2][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[2][2].proteins.carbs +
            MealFood.mealplan[2][3].fats.carbs
          var totalProt =
            MealFood.mealplan[2][0].calories.prot +
            meal.prot +
            MealFood.mealplan[2][2].proteins.prot +
            MealFood.mealplan[2][3].fats.prot
          var totalFats =
            MealFood.mealplan[2][0].calories.fats +
            meal.fats +
            MealFood.mealplan[2][2].proteins.fats +
            MealFood.mealplan[2][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[2][1].carbs = meal
          MealFood.mealplan[2][4].total.totalCal = totalCal
          MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[2][4].total.totalProt = totalProt
          MealFood.mealplan[2][4].total.totalFats = totalFats
          MealFood.mealplan[2][4].total.CarboPer = CarboPer
          MealFood.mealplan[2][4].total.ProtPer = ProtPer
          MealFood.mealplan[2][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal32 : mealname }});
          var totalCal =
            MealFood.mealplan[2][0].calories.cal +
            MealFood.mealplan[2][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[2][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[2][0].calories.carbs +
            MealFood.mealplan[2][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[2][3].fats.carbs
          var totalProt =
            MealFood.mealplan[2][0].calories.prot +
            MealFood.mealplan[2][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[2][3].fats.prot
          var totalFats =
            MealFood.mealplan[2][0].calories.fats +
            MealFood.mealplan[2][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[2][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[2][2].proteins = meal
          MealFood.mealplan[2][4].total.totalCal = totalCal
          MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[2][4].total.totalProt = totalProt
          MealFood.mealplan[2][4].total.totalFats = totalFats
          MealFood.mealplan[2][4].total.CarboPer = CarboPer
          MealFood.mealplan[2][4].total.ProtPer = ProtPer
          MealFood.mealplan[2][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal33 : mealname }});
          var totalCal =
            MealFood.mealplan[2][0].calories.cal +
            MealFood.mealplan[2][1].carbs.cal +
            MealFood.mealplan[2][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[2][0].calories.carbs +
            MealFood.mealplan[2][1].carbs.carbs +
            MealFood.mealplan[2][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[2][0].calories.prot +
            MealFood.mealplan[2][1].carbs.prot +
            MealFood.mealplan[2][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[2][0].calories.fats +
            MealFood.mealplan[2][1].carbs.fats +
            MealFood.mealplan[2][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[2][3].fats = meal
          MealFood.mealplan[2][4].total.totalCal = totalCal
          MealFood.mealplan[2][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[2][4].total.totalProt = totalProt
          MealFood.mealplan[2][4].total.totalFats = totalFats
          MealFood.mealplan[2][4].total.CarboPer = CarboPer
          MealFood.mealplan[2][4].total.ProtPer = ProtPer
          MealFood.mealplan[2][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 4) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal40 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[3][1].carbs.cal +
            MealFood.mealplan[3][2].proteins.cal +
            MealFood.mealplan[3][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[3][1].carbs.carbs +
            MealFood.mealplan[3][2].proteins.carbs +
            MealFood.mealplan[3][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[3][1].carbs.prot +
            MealFood.mealplan[3][2].proteins.prot +
            MealFood.mealplan[3][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[3][1].carbs.fats +
            MealFood.mealplan[3][2].proteins.fats +
            MealFood.mealplan[3][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[3][0].calories = meal
          MealFood.mealplan[3][4].total.totalCal = totalCal
          MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[3][4].total.totalProt = totalProt
          MealFood.mealplan[3][4].total.totalFats = totalFats
          MealFood.mealplan[3][4].total.CarboPer = CarboPer
          MealFood.mealplan[3][4].total.ProtPer = ProtPer
          MealFood.mealplan[3][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal41 : mealname }});
          var totalCal =
            MealFood.mealplan[3][0].calories.cal +
            meal.cal +
            MealFood.mealplan[3][2].proteins.cal +
            MealFood.mealplan[3][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[3][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[3][2].proteins.carbs +
            MealFood.mealplan[3][3].fats.carbs
          var totalProt =
            MealFood.mealplan[3][0].calories.prot +
            meal.prot +
            MealFood.mealplan[3][2].proteins.prot +
            MealFood.mealplan[3][3].fats.prot
          var totalFats =
            MealFood.mealplan[3][0].calories.fats +
            meal.fats +
            MealFood.mealplan[3][2].proteins.fats +
            MealFood.mealplan[3][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[3][1].carbs = meal
          MealFood.mealplan[3][4].total.totalCal = totalCal
          MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[3][4].total.totalProt = totalProt
          MealFood.mealplan[3][4].total.totalFats = totalFats
          MealFood.mealplan[3][4].total.CarboPer = CarboPer
          MealFood.mealplan[3][4].total.ProtPer = ProtPer
          MealFood.mealplan[3][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal42 : mealname }});
          var totalCal =
            MealFood.mealplan[3][0].calories.cal +
            MealFood.mealplan[3][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[3][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[3][0].calories.carbs +
            MealFood.mealplan[3][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[3][3].fats.carbs
          var totalProt =
            MealFood.mealplan[3][0].calories.prot +
            MealFood.mealplan[3][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[3][3].fats.prot
          var totalFats =
            MealFood.mealplan[3][0].calories.fats +
            MealFood.mealplan[3][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[3][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[3][2].proteins = meal
          MealFood.mealplan[3][4].total.totalCal = totalCal
          MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[3][4].total.totalProt = totalProt
          MealFood.mealplan[3][4].total.totalFats = totalFats
          MealFood.mealplan[3][4].total.CarboPer = CarboPer
          MealFood.mealplan[3][4].total.ProtPer = ProtPer
          MealFood.mealplan[3][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal43 : mealname }});
          var totalCal =
            MealFood.mealplan[3][0].calories.cal +
            MealFood.mealplan[3][1].carbs.cal +
            MealFood.mealplan[3][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[3][0].calories.carbs +
            MealFood.mealplan[3][1].carbs.carbs +
            MealFood.mealplan[3][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[3][0].calories.prot +
            MealFood.mealplan[3][1].carbs.prot +
            MealFood.mealplan[3][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[3][0].calories.fats +
            MealFood.mealplan[3][1].carbs.fats +
            MealFood.mealplan[3][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[3][3].fats = meal
          MealFood.mealplan[3][4].total.totalCal = totalCal
          MealFood.mealplan[3][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[3][4].total.totalProt = totalProt
          MealFood.mealplan[3][4].total.totalFats = totalFats
          MealFood.mealplan[3][4].total.CarboPer = CarboPer
          MealFood.mealplan[3][4].total.ProtPer = ProtPer
          MealFood.mealplan[3][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 5) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal50 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[4][1].carbs.cal +
            MealFood.mealplan[4][2].proteins.cal +
            MealFood.mealplan[4][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[4][1].carbs.carbs +
            MealFood.mealplan[4][2].proteins.carbs +
            MealFood.mealplan[4][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[4][1].carbs.prot +
            MealFood.mealplan[4][2].proteins.prot +
            MealFood.mealplan[4][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[4][1].carbs.fats +
            MealFood.mealplan[4][2].proteins.fats +
            MealFood.mealplan[4][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[4][0].calories = meal
          MealFood.mealplan[4][4].total.totalCal = totalCal
          MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[4][4].total.totalProt = totalProt
          MealFood.mealplan[4][4].total.totalFats = totalFats
          MealFood.mealplan[4][4].total.CarboPer = CarboPer
          MealFood.mealplan[4][4].total.ProtPer = ProtPer
          MealFood.mealplan[4][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal51 : mealname }});
          var totalCal =
            MealFood.mealplan[4][0].calories.cal +
            meal.cal +
            MealFood.mealplan[4][2].proteins.cal +
            MealFood.mealplan[4][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[4][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[4][2].proteins.carbs +
            MealFood.mealplan[4][3].fats.carbs
          var totalProt =
            MealFood.mealplan[4][0].calories.prot +
            meal.prot +
            MealFood.mealplan[4][2].proteins.prot +
            MealFood.mealplan[4][3].fats.prot
          var totalFats =
            MealFood.mealplan[4][0].calories.fats +
            meal.fats +
            MealFood.mealplan[4][2].proteins.fats +
            MealFood.mealplan[4][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[4][1].carbs = meal
          MealFood.mealplan[4][4].total.totalCal = totalCal
          MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[4][4].total.totalProt = totalProt
          MealFood.mealplan[4][4].total.totalFats = totalFats
          MealFood.mealplan[4][4].total.CarboPer = CarboPer
          MealFood.mealplan[4][4].total.ProtPer = ProtPer
          MealFood.mealplan[4][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal52 : mealname }});
          var totalCal =
            MealFood.mealplan[4][0].calories.cal +
            MealFood.mealplan[4][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[4][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[4][0].calories.carbs +
            MealFood.mealplan[4][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[4][3].fats.carbs
          var totalProt =
            MealFood.mealplan[4][0].calories.prot +
            MealFood.mealplan[4][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[4][3].fats.prot
          var totalFats =
            MealFood.mealplan[4][0].calories.fats +
            MealFood.mealplan[4][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[4][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[4][2].proteins = meal
          MealFood.mealplan[4][4].total.totalCal = totalCal
          MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[4][4].total.totalProt = totalProt
          MealFood.mealplan[4][4].total.totalFats = totalFats
          MealFood.mealplan[4][4].total.CarboPer = CarboPer
          MealFood.mealplan[4][4].total.ProtPer = ProtPer
          MealFood.mealplan[4][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal53 : mealname }});
          var totalCal =
            MealFood.mealplan[4][0].calories.cal +
            MealFood.mealplan[4][1].carbs.cal +
            MealFood.mealplan[4][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[4][0].calories.carbs +
            MealFood.mealplan[4][1].carbs.carbs +
            MealFood.mealplan[4][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[4][0].calories.prot +
            MealFood.mealplan[4][1].carbs.prot +
            MealFood.mealplan[4][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[4][0].calories.fats +
            MealFood.mealplan[4][1].carbs.fats +
            MealFood.mealplan[4][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[4][3].fats = meal
          MealFood.mealplan[4][4].total.totalCal = totalCal
          MealFood.mealplan[4][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[4][4].total.totalProt = totalProt
          MealFood.mealplan[4][4].total.totalFats = totalFats
          MealFood.mealplan[4][4].total.CarboPer = CarboPer
          MealFood.mealplan[4][4].total.ProtPer = ProtPer
          MealFood.mealplan[4][4].total.FatsPer = FatsPer
        }
      }

      if (mealno == 6) {
        if (foodposition == 0) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal60 : mealname }});
          var totalCal =
            meal.cal +
            MealFood.mealplan[5][1].carbs.cal +
            MealFood.mealplan[5][2].proteins.cal +
            MealFood.mealplan[5][3].fats.cal
          var totalCarbo =
            meal.carbs +
            MealFood.mealplan[5][1].carbs.carbs +
            MealFood.mealplan[5][2].proteins.carbs +
            MealFood.mealplan[5][3].fats.carbs
          var totalProt =
            meal.prot +
            MealFood.mealplan[5][1].carbs.prot +
            MealFood.mealplan[5][2].proteins.prot +
            MealFood.mealplan[5][3].fats.prot
          var totalFats =
            meal.fats +
            MealFood.mealplan[5][1].carbs.fats +
            MealFood.mealplan[5][2].proteins.fats +
            MealFood.mealplan[5][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[5][0].calories = meal
          MealFood.mealplan[5][4].total.totalCal = totalCal
          MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[5][4].total.totalProt = totalProt
          MealFood.mealplan[5][4].total.totalFats = totalFats
          MealFood.mealplan[5][4].total.CarboPer = CarboPer
          MealFood.mealplan[5][4].total.ProtPer = ProtPer
          MealFood.mealplan[5][4].total.FatsPer = FatsPer
        }
        if (foodposition == 1) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal61 : mealname }});
          var totalCal =
            MealFood.mealplan[5][0].calories.cal +
            meal.cal +
            MealFood.mealplan[5][2].proteins.cal +
            MealFood.mealplan[5][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[5][0].calories.carbs +
            meal.carbs +
            MealFood.mealplan[5][2].proteins.carbs +
            MealFood.mealplan[5][3].fats.carbs
          var totalProt =
            MealFood.mealplan[5][0].calories.prot +
            meal.prot +
            MealFood.mealplan[5][2].proteins.prot +
            MealFood.mealplan[5][3].fats.prot
          var totalFats =
            MealFood.mealplan[5][0].calories.fats +
            meal.fats +
            MealFood.mealplan[5][2].proteins.fats +
            MealFood.mealplan[5][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[5][1].carbs = meal
          MealFood.mealplan[5][4].total.totalCal = totalCal
          MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[5][4].total.totalProt = totalProt
          MealFood.mealplan[5][4].total.totalFats = totalFats
          MealFood.mealplan[5][4].total.CarboPer = CarboPer
          MealFood.mealplan[5][4].total.ProtPer = ProtPer
          MealFood.mealplan[5][4].total.FatsPer = FatsPer
        }
        if (foodposition == 2) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal62 : mealname }});
          var totalCal =
            MealFood.mealplan[5][0].calories.cal +
            MealFood.mealplan[5][1].carbs.cal +
            meal.cal +
            MealFood.mealplan[5][3].fats.cal
          var totalCarbo =
            MealFood.mealplan[5][0].calories.carbs +
            MealFood.mealplan[5][1].carbs.carbs +
            meal.carbs +
            MealFood.mealplan[5][3].fats.carbs
          var totalProt =
            MealFood.mealplan[5][0].calories.prot +
            MealFood.mealplan[5][1].carbs.prot +
            meal.prot +
            MealFood.mealplan[5][3].fats.prot
          var totalFats =
            MealFood.mealplan[5][0].calories.fats +
            MealFood.mealplan[5][1].carbs.fats +
            meal.fats +
            MealFood.mealplan[5][3].fats.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[5][2].proteins = meal
          MealFood.mealplan[5][4].total.totalCal = totalCal
          MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[5][4].total.totalProt = totalProt
          MealFood.mealplan[5][4].total.totalFats = totalFats
          MealFood.mealplan[5][4].total.CarboPer = CarboPer
          MealFood.mealplan[5][4].total.ProtPer = ProtPer
          MealFood.mealplan[5][4].total.FatsPer = FatsPer
        }
        if (foodposition == 3) {
          //var updateArray = await query.findOneAndUpdate(usermealcoll, { _id : usermealId }, { $push: { meal63 : mealname }});
          var totalCal =
            MealFood.mealplan[5][0].calories.cal +
            MealFood.mealplan[5][1].carbs.cal +
            MealFood.mealplan[5][2].proteins.cal +
            meal.cal
          var totalCarbo =
            MealFood.mealplan[5][0].calories.carbs +
            MealFood.mealplan[5][1].carbs.carbs +
            MealFood.mealplan[5][2].proteins.carbs +
            meal.carbs
          var totalProt =
            MealFood.mealplan[5][0].calories.prot +
            MealFood.mealplan[5][1].carbs.prot +
            MealFood.mealplan[5][2].proteins.prot +
            meal.prot
          var totalFats =
            MealFood.mealplan[5][0].calories.fats +
            MealFood.mealplan[5][1].carbs.fats +
            MealFood.mealplan[5][2].proteins.fats +
            meal.fats
          var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100
          var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100
          var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100
          MealFood.mealplan[5][3].fats = meal
          MealFood.mealplan[5][4].total.totalCal = totalCal
          MealFood.mealplan[5][4].total.totalCarbo = totalCarbo
          MealFood.mealplan[5][4].total.totalProt = totalProt
          MealFood.mealplan[5][4].total.totalFats = totalFats
          MealFood.mealplan[5][4].total.CarboPer = CarboPer
          MealFood.mealplan[5][4].total.ProtPer = ProtPer
          MealFood.mealplan[5][4].total.FatsPer = FatsPer
        }
      }

      var UpdateMealFood = await query.findOneAndUpdate(
        usermealcoll,
        { _id: usermealId },
        { $set: { mealplan: MealFood.mealplan } }
      )
      return responseModel.successResponse(
        'Meal food swap successfully',
        UpdateMealFood
      )
    } else {
      return responseModel.failResponse('No Food Found!')
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message
    return responseModel.failResponse(
      "Error while swaping user's meal food: " + errMessage
    )
  }
}
