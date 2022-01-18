const express = require('express')
const router = express.Router()
const { userCtrl } = require('../controller')

const JWT = require('./jwt')
const { fileUpload } = require('../service')

const joiSchema = require('./joischema')
const joivalidate = require('./joivalidate')
var CronJob = require('cron').CronJob

//--- CRON JOB ---
// new CronJob("0 0 */3 * *", userCtrl.user_reminder, null, true); // every 3rd day-of-month.
// new CronJob("* * * * *", userCtrl.user_reminder, null, true); // every minute / sec  // * * * * * // * * * * * *

// user register api
router.post(
  '/register',
  [joivalidate.joivalidate(joiSchema.Registration)],
  async (req, res) => {
    let result = await userCtrl.createUser(req.body)
    // console.log(result)
    res.status(result.code).send(result)
    // console.log(result)
    // res.send(result);
  }
)

// check email api
router.post('/checkEmail', async (req, res) => {
  let result = await userCtrl.checkEmail(req.body)
  res.status(result.code).send(result)
})
// check Mobile number api
router.post('/checkMobilenumber', async (req, res) => {
  let result = await userCtrl.checkMobilenumber(req.body)
  res.status(result.code).send(result)
})

//get list of exercise
router.post('/exerciseList', JWT.authToken, async (req, res) => {
  let result = await userCtrl.exerciseList(req)
  res.status(result.code).send(result)
})

//add user exercise
router.post('/addUserExercise', JWT.authToken, async (req, res) => {
  let result = await userCtrl.addExercise(req)
  res.status(result.code).send(result)
})

//fetch user exercise
router.post('/getUserExercise', JWT.authToken, async (req, res) => {
  let result = await userCtrl.userExerciseList(req)
  res.status(result.code).send(result)
})

//Apple watch data
router.post('/storeWatchData', JWT.authToken, async (req, res) => {
  let result = await userCtrl.appleWatchCalData(req)
  res.status(result.code).send(result)
})

//calories intake api
router.post('/caloriesIntake', JWT.authToken, async (req, res) => {
  let result = await userCtrl.caloriesIntake(req)
  res.status(result.code).send(result)
})
//user login api
router.post(
  '/login',
  [joivalidate.joivalidate(joiSchema.Login)],
  async (req, res) => {
    let result = await userCtrl.loginUser(req.body)
    res.status(result.code).send(result)
  }
)

//user personal details api
router.get('/getProfile', JWT.authToken, async (req, res) => {
  let result = await userCtrl.getUserProfile(req)
  res.status(result.code).send(result)
})

//user account details api
router.get('/getAccount', JWT.authToken, async (req, res) => {
  let result = await userCtrl.getUserAccount(req)
  res.status(result.code).send(result)
})

//user account delete api
router.delete('/deleteAccount', JWT.authToken, async (req, res) => {
  let result = await userCtrl.deleteUserAcc(req)
  res.status(result.code).send(result)
})

//user update personal details api
router.post(
  '/updateProfile',
  [joivalidate.joivalidate(joiSchema.Editprofile), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.updateUserProfile(req)
    res.status(result.code).send(result)
  }
)

//update user
router.post('/updateUsers', JWT.authToken, async (req, res) => {
  let result = await userCtrl.updateUsers(req)
  res.status(result.code).send(result)
})

//user update name
router.post(
  '/updateName',
  [joivalidate.joivalidate(joiSchema.EditName), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.updateUserName(req)
    res.status(result.code).send(result)
  }
)

//user update dob
router.post(
  '/updateDob',
  [joivalidate.joivalidate(joiSchema.EditDob), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.updateUserDob(req)
    res.status(result.code).send(result)
  }
)

//user update gender
router.post(
  '/updateGender',
  [joivalidate.joivalidate(joiSchema.EditGender), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.updateUserGender(req)
    res.status(result.code).send(result)
  }
)

//user update weight
router.post(
  '/updateWeight',
  [joivalidate.joivalidate(joiSchema.EditWeight), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.updateUserWeight(req)
    res.status(result.code).send(result)
  }
)

//user update bodyfat
router.post(
  '/updateBodyfat',
  [joivalidate.joivalidate(joiSchema.EditBodyfat), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.updateUserBodyfat(req)
    res.status(result.code).send(result)
  }
)

//user update body type
router.post('/updateBodytype', JWT.authToken, async (req, res) => {
  let result = await userCtrl.updateUserBodytype(req)
  res.status(result.code).send(result)
})

//user update macro
router.post(
  '/updateMacro',
  [joivalidate.joivalidate(joiSchema.EditMacro), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.updateUserMacro(req)
    res.status(result.code).send(result)
  }
)

//user update physical activity level
router.post(
  '/updatePhysicalActivity',
  [joivalidate.joivalidate(joiSchema.EditAcitvity), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.updateUserPhysicalActivity(req)
    res.status(result.code).send(result)
  }
)

//user update goal
router.post('/updateGoal', JWT.authToken, async (req, res) => {
  let result = await userCtrl.updateUserGoal(req)
  res.status(result.code).send(result)
})

//user update diet type
router.post(
  '/updateDietType',
  [joivalidate.joivalidate(joiSchema.EditDiet), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.updateUserDietType(req)
    res.status(result.code).send(result)
  }
)

//user chnagepassword api
router.post(
  '/changePassword',
  [joivalidate.joivalidate(joiSchema.Changepassword), JWT.authToken],
  async (req, res) => {
    let result = await userCtrl.changePassword(req)
    res.status(result.code).send(result)
  }
)

//user forgot password api
router.post('/forgotPassword', async (req, res) => {
  let result = await userCtrl.forgotPassword(req)
  res.status(result.code).send(result)
})

//user ON/OFF push notification
router.post('/switchNotification', JWT.authToken, async (req, res) => {
  let result = await userCtrl.switchNotification(req)
  res.status(result.code).send(result)
})

//user mean plan generate api
router.post('/generateMealPlan', JWT.authToken, async (req, res) => {
  let result = await userCtrl.generatemealplan(req)
  res.status(result.code).send(result)
})

//get user meal plan api
router.post('/getUserMealPlan', JWT.authToken, async (req, res) => {
  let result = await userCtrl.getUserMealPlan(req)
  res.status(result.code).send(result)
})

//update intake water data
router.post('/updateWaterIntake', JWT.authToken, async (req, res) => {
  let result = await userCtrl.updateWaterIntake(req)
  res.status(result.code).send(result)
})

//swap meal food request api
router.post('/swapMealFoodRequest', JWT.authToken, async (req, res) => {
  let result = await userCtrl.swapMealFoodRequest(req)
  res.status(result.code).send(result)
})

//swap meal food api
router.post('/swapMealFood', JWT.authToken, async (req, res) => {
  let result = await userCtrl.swapMealFood(req)
  res.status(result.code).send(result)
})

//user select date for start meal plan
router.post('/mealplanStartDate', JWT.authToken, async (req, res) => {
  let result = await userCtrl.mealplanStartDate(req)
  res.status(result.code).send(result)
})

//user photo upload api
router.post(
  '/userUploadPhoto',
  fileUpload.userphotoupload,
  JWT.authToken,
  async (req, res) => {
    let result = await userCtrl.useruploadphoto(req)
    res.status(result.code).send(result)
  }
)

//user multi photo upload api NEW
router.post(
  '/userMultiPhotoUpload',
  fileUpload.usermultiphotoupload,
  JWT.authToken,
  async (req, res) => {
    let result = await userCtrl.userMultiPhotoUpload(req)
    res.status(result.code).send(result)
  }
)

//user photo delete api
router.delete('/userDeletePhoto/:photo_id', JWT.authToken, async (req, res) => {
  let result = await userCtrl.userdeletephoto(req)
  res.status(result.code).send(result)
})

//user collection photo delete api NEW
router.post('/userPhotoDelete', JWT.authToken, async (req, res) => {
  let result = await userCtrl.userPhotoDelete(req)
  res.status(result.code).send(result)
})

//user collection delete api NEW
router.delete(
  '/userDeleteCollection/:photo_id',
  JWT.authToken,
  async (req, res) => {
    let result = await userCtrl.userDeleteCollection(req)
    res.status(result.code).send(result)
  }
)

//user photo list api
router.get('/userPhotoList', JWT.authToken, async (req, res) => {
  let result = await userCtrl.userphotolist(req)
  res.status(result.code).send(result)
})

//user photo list api with pagination NEW //working api
router.post('/userListPhoto', JWT.authToken, async (req, res) => {
  let result = await userCtrl.userListPhoto(req)
  res.status(result.code).send(result)
})

//user subscribe plan api
router.post('/userPlanSubscribe', JWT.authToken, async (req, res) => {
  let result = await userCtrl.userplansubscribe(req)
  res.status(result.code).send(result)
})

//user check subscribe plan api
router.get('/userSubscriptionCheck', JWT.authToken, async (req, res) => {
  let result = await userCtrl.userchecksub(req)
  res.status(result.code).send(result)
})

//user groceries api
router.get('/userGroceriesList', JWT.authToken, async (req, res) => {
  let result = await userCtrl.usergrocerie(req)
  res.status(result.code).send(result)
})

//new mealplan pdf api
router.post(
  '/newmealplanpdfgenerate',
  JWT.authToken,
  userCtrl.newmealplanpdfgenerate
)

//generate mealplan pdf api
router.post('/mealplanpdfGenerate', JWT.authToken, async (req, res) => {
  let result = await userCtrl.mealplanpdfgenerate(req)
  res.status(result.code).send(result)
})

//generate mealplan Groceries pdf api
router.post('/groceriePdfGenerate', JWT.authToken, async (req, res) => {
  let result = await userCtrl.groceriePdfGenerate(req)
  res.status(result.code).send(result)
})

//user activity graph api
// router.post('/userActivityGraph', JWT.authToken, async (req, res) => {
// 	let result = await userCtrl.useractivity(req);
// 	res.status(result.code).send(result);
// });

//real time user activity graph api
router.post('/realTimeActivityGraph', JWT.authToken, async (req, res) => {
  let result = await userCtrl.realTimeActivityGraph(req)
  res.status(result.code).send(result)
})

//Latest graph api
router.post('/realTimeUserGraph', JWT.authToken, async (req, res) => {
  let result = await userCtrl.realTimeUserGraph(req)
  res.status(result.code).send(result)
})

//user current weight , bodyfat, lbm, bmr get api
router.get('/userCurrentStatus', JWT.authToken, async (req, res) => {
  let result = await userCtrl.userCurrentStatus(req)
  res.status(result.code).send(result)
})

//user update weight & bodyfat
router.post('/update_weight_bodyfat', JWT.authToken, async (req, res) => {
  let result = await userCtrl.update_weight_bodyfat(req)
  res.status(result.code).send(result)
})

//replace meal
router.post('/replacefood', async (req, res) => {
  let result = await userCtrl.replacefood(req)
  res.status(result.code).send(result)
})

//replace mealplan
router.post('/replaceMealPlan', async (req, res) => {
  let result = await userCtrl.replaceMealPlan(req)
  res.status(result.code).send(result)
})

//replace user image
router.post('/replaceUserImage', async (req, res) => {
  let result = await userCtrl.replaceUserImage(req)
  res.status(result.code).send(result)
})

router.post('/updateAppVersion', async (req, res) => {
  let result = await userCtrl.updateAppVersion(req)
  res.status(result.code).send(result)
})

router.get('/getAppVersion', async (req, res) => {
  let result = await userCtrl.getAppVersion(req)
  res.status(result.code).send(result)
})

//swap meal food api
router.post('/swapMealFoodV2', JWT.authToken, async (req, res) => {
  let result = await userCtrl.swapMealFoodV2(req)
  res.status(result.code).send(result)
})

module.exports = router
