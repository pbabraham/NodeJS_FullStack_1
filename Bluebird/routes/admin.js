const express = require('express');
const router = express.Router();
const { adminCtrl } = require('../controller');

const JWT = require('./jwt');
const { fileUpload } = require('../service');

const joiSchema = require('./joischema');
const joivalidate = require('./joivalidate');
var CronJob = require('cron').CronJob;

//---- admin panel ----

router.post('/login', async (req, res) => {
	let result = await adminCtrl.login(req.body);
	res.status(result.code).send(result);
});

// get all user list api
router.get('/getAllUser', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.getAllUser(req);
	console.log(result.data.length)
	res.status(result.code).send(result);
});

// get user by id api
router.get('/getUser/:user_id', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.getUserById(req);
	res.status(result.code).send(result);
});



// //Upload exercise images
// router.post('/exerciseImages', fileUpload.uploadfileExercise, JWT.authToken, async (req, res) => {
// 	let result = await adminCtrl.uploadExerciseImages(req);
// 	res.status(result.code).send(result);
// });
//Upload exercise images
router.post('/exerciseImages', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.uploadExerciseImages(req);
	res.status(result.code).send(result);
});


//update user api
router.post('/updateUser', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.updateUser(req);
	res.status(result.code).send(result);
});

//delete user api
router.delete('/deleteUser/:user_id', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.deleteUser(req);
	res.status(result.code).send(result);
});

//delete bulk user api - pending
router.post('/deletebulkUser', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.deletebulkUser(req);
	res.status(result.code).send(result);
});

// user block - unblock api
router.post('/updateUserStatus', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.userStatus(req);
	res.status(result.code).send(result);
});

// what type of plan is more popular - diet plan
router.get('/planAnalytics', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.planAnalytics(req);
	res.status(result.code).send(result);
});

// weekly, monthly, quarterly and yearly data of
//average weight gain for people who use the weight gain program api.
router.post('/analytics_weight_gain', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.analyticsWeightGain(req);
	res.status(result.code).send(result);
});

// weekly, monthly, quarterly and yearly data of
//Analytics average weight, Bodyfat, BMR, and LBM for people who use the weight loss program api
router.post('/analytics_weight_loss', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.analyticsWeightLoss(req);
	res.status(result.code).send(result);
});

//Add and manage new food with combination
router.post('/addmealCombination', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.addmealCombination(req);
	res.status(result.code).send(result);
});

//Get food combination
router.get('/getCombination', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.getCombination(req);
	res.status(result.code).send(result);
});

// create admin api one time
router.get('/createAdmin', async (req, res) => {
	let result = await adminCtrl.createAdmin(req, res);
	res.status(result.code).send(result);
});

router.post('/testUserApi', JWT.authToken , async (req, res) => {
	let result = await adminCtrl.testapi(req, res);
	res.status(result.code).send(result);
});

//--- cms page managment - admin ---

router.post('/cmsAdd', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.cmsAdd(req);
	res.status(result.code).send(result);
});

// update cms page
router.post('/cmsUpdate', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.cmsUpdate(req);
	res.status(result.code).send(result);
});

// get list of cms page
router.get('/cmsList', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.cmsList(req);
	res.status(result.code).send(result);
});

//delete cms page
router.delete('/cmsDelete/:cms_id', JWT.authToken, async (req, res) => {
	let result = await adminCtrl.cmsDelete(req);
	res.status(result.code).send(result);
});

// router.post('/uploadImage',fileUpload.base64fileUpload, async (req, res) => {
//     res.status(200).send({code:200,url:req.body.image});
// })


module.exports = router;