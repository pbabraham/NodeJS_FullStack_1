const express = require('express')
const router = express.Router()
const { mealCtrl } = require('../controller')
const JWT = require('./jwt')
const { fileUpload } = require('../service')
const joiSchema = require('./joischema')
const joivalidate = require('./joivalidate')

//add new meal api
router.post(
  '/addnewmeal',
  fileUpload.uploadfile,
  JWT.authToken,
  async (req, res) => {
    let result = await mealCtrl.addnewmeal(req)
    res.status(result.code).send(result)
  }
)

//Bulk upload  api

router.post(
  '/bulkupload',
  fileUpload.bulkUpload,
  JWT.authToken,
  mealCtrl.mealBulkUpload
)

//Delete duplicate meal  api
router.post('/deleteDuplicateMeal', JWT.authToken, mealCtrl.deleteDuplicateMeal)

//update meal api
router.post(
  '/updatemeal',
  fileUpload.uploadfile,
  JWT.authToken,
  async (req, res) => {
    let result = await mealCtrl.updatemeal(req)
    res.status(result.code).send(result)
  }
)

//delete meal api
router.delete('/delete/:meal_id', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.deletemeal(req)
  res.status(result.code).send(result)
})

//list all meal
router.get('/listmeal', async (req, res) => {
  let result = await mealCtrl.listmeal(req)
  res.status(result.code).send(result)
})

router.get('/getById/:categoryId', async (req, res) => {
  let result = await mealCtrl.getById(req)
  res.status(result.code).send(result)
})

router.post('/delete', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.removeAll(req)
  res.status(result.code).send(result)
})

router.post('/getMealBySameName', async (req, res) => {
  let result = await mealCtrl.getMealsWithSameName(req)
  res.status(result.code).send(result)
})

router.post('/searchMealByCategory', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.searchMealByCategory(req)
  res.status(result.code).send(result)
})

router.post('/addFavouriteMeal', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.addMealToFavourites(req)
  res.status(result.code).send(result)
})

router.post('/getFavouriteCarbMeals', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getFavouriteCarbs(req)
  res.status(result.code).send(result)
})

router.post('/getFavouriteFatMeals', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getFavouriteFats(req)
  res.status(result.code).send(result)
})

router.post('/getFavouriteProteinMeals', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getFavouriteProteins(req)
  res.status(result.code).send(result)
})

router.post('/getFavouriteFruitVegMeals', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getFavouriteFruitVeggies(req)
  res.status(result.code).send(result)
})

router.post('/getFavoritesAll', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getFavoritesAll(req)
  res.status(result.code).send(result)
})

router.delete('/removeFavourite/:id', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.removeFromFavourites(req)
  res.status(result.code).send(result)
})

// router.get('/searchFavourite', JWT.authToken, async (req, res) => {
//   let result = await mealCtrl.searchFavouriteMeal(req)
//   res.status(result.code).send(result)
// })

router.post('/addMealsToRecent', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.addMealToRecent(req)
  res.status(result.code).send(result)
})

router.post('/getRecentCarbs', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getRecentCarbs(req)
  res.status(result.code).send(result)
})

router.post('/getRecentFats', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getRecentFats(req)
  res.status(result.code).send(result)
})

router.post('/getRecentProteins', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getRecentProteins(req)
  res.status(result.code).send(result)
})

router.post('/getRecentFruitVegMeals', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getRecentFruitVeggies(req)
  res.status(result.code).send(result)
})

router.post('/getRecentAll', JWT.authToken, async (req, res) => {
  let result = await mealCtrl.getRecentsAll(req)
  res.status(result.code).send(result)
})
module.exports = router
