const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const admin = require("firebase-admin");
let serviceAccountKey = require("../serviceAccountKey.json");
// const { query, userQuery } = require('../query');
const query = require('../query/query');
const { responseModel } = require('../model');

/*  SERVICES */
//var CompanyService = require('./companyService')

/* MODELS */
let User = mongoose.model('user');
let Meal = mongoose.model('meal');
let usermealcoll = mongoose.model('usermeal');
let premiumplancoll = mongoose.model('premiumplan');
let mealcombocoll = mongoose.model('mealcombo');

// FCM Initialization
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: ""
 });

exports.getUser = async function (query) {

  try {
    var userdata = await User.findOne(query);
    return userdata;

  } catch (e) {
    // Log Errors
    throw Error('Error while getting user ' + e)
  }
}

// FOR MALE v2 latest
exports.preparemealplan1v2 = async function (usercalories, usercarbs, userprotein, userfat, mealpercentage) {

  var usercalories = usercalories;
  var usercarbs = usercarbs;
  var userprotein = userprotein;
  var userfat = userfat;
  var mealpercentage= mealpercentage;
  var finalmealplan = []
  
    for (let j = 0; j < mealpercentage.length; j++) {
    
    let mealcal = Math.round(usercalories * mealpercentage[j]/100);
    let mealcrab = Math.round((mealcal * usercarbs / 100) / 4)
    let mealprotein = Math.round((mealcal * userprotein / 100) / 4)
    let mealfat = Math.round((mealcal * userfat / 100) / 9)

    var meal = { cal: mealcal ? mealcal : 0, carb: mealcrab ? mealcrab : 0, protein: mealprotein ? mealprotein : 0, fat: mealfat ? mealfat : 0 }

    finalmealplan.push(meal);
    }

  // console.log("finalmealplan--", finalmealplan);

  return finalmealplan;
}

// get meal query latest
exports.getmeal = async function (dietfilter, mealVal,category) {
    
  try {
    var category = category;
    // console.log(typeof dietfilter);
    // console.log("dietfilter----",dietfilter);
  
    var globalCrab = 20;
    var globalFat = 15;
    var RequiredCarb = mealVal.carb;
    var RequiredProt = mealVal.protein;
    var RequiredCal = mealVal.cal;
    var RequiredFat = mealVal.fat;
    
    var protValue = mealVal.protein - 12;
    var dietfilter1 = dietfilter;
    var dietfilter2 = dietfilter;
    var dietfilter3 = dietfilter;
    var dietfilter4 = dietfilter;
    
    dietfilter1.category = category[0]
    // console.log("dietfilter1-----",dietfilter1);
    
    var mealCal = await Meal.aggregate([
      { $match: dietfilter1 },
      { $project: { diff: { $abs: { $subtract: [protValue,{ $sum: [ '$prot', "0.1" ] } ] } }, doc: '$$ROOT' } },
      { $sort: { diff: 1 } },
      { $limit: 1 }
    ])

    // console.log(mealCal[0].doc);
    
    dietfilter2.category = category[1]
    var ReCarb = RequiredCarb - mealCal[0].doc.carbs;
    var ReProt = RequiredProt - mealCal[0].doc.prot;
    var ReCal = RequiredCal - mealCal[0].doc.cal;
    var ReFat = RequiredFat - mealCal[0].doc.fats;
    var carbPercentage = (globalCrab / 100) * ReCarb;
    var food2 = ReCarb - carbPercentage;
    // console.log("carbPercentage",carbPercentage);
    // console.log("food2",food2);
    dietfilter2.prot = { $lte: ReProt }
    // console.log("dietfilter2---",dietfilter2);
  
    var mealCarbs = await Meal.aggregate([
      { $match: dietfilter2 },
      { $project: { diff: { $abs: { $subtract: [food2,{ $sum: [ '$carbs', "0.1" ] } ] } }, doc: '$$ROOT' } },
      { $sort: { diff: 1 } },
      { $limit: 1 }
    ])

    // console.log(mealCarbs[0].doc);
    
    dietfilter3.category = category[2];
    var totalFat = mealCal[0].doc.fats + mealCarbs[0].doc.fats;
    var RemainFat = RequiredFat - totalFat;
    var fatPercentage = (globalFat / 100) * RemainFat;
    var food3 = RemainFat - fatPercentage;
    // console.log("fatPercentage",fatPercentage);
    // console.log("food3",food3);

    var mealProts = await Meal.aggregate([
      { $match: dietfilter3 },
      { $project: { diff: { $abs: { $subtract: [food3,{ $sum: [ '$fats', "0.1" ] } ] } }, doc: '$$ROOT' } },
      { $sort: { diff: 1 } },
      { $limit: 1 }
    ])
    // console.log("--",mealProts);
  
    dietfilter4.category = category[3]
    //console.log("dietfilter4---",dietfilter4);
    var totalCarb = mealCal[0].doc.carbs + mealCarbs[0].doc.carbs + mealProts[0].doc.carbs
    var choosCarb = RequiredCarb - totalCarb;
    // console.log("choosCarb--",choosCarb);
    
    var mealFats = await Meal.aggregate([
      { $match: dietfilter4 },
      { $project: { diff: { $abs: { $subtract: [choosCarb,{ $sum: [ '$carbs', "0.1" ] } ] } }, doc: '$$ROOT' } },
      { $sort: { diff: 1 } },
      { $limit: 1 }
    ])
    
    var tempmeal = [];
    var meal = [];

    var tempcal  = mealCal[0] ? mealCal[0].doc : {}
    var tempcarb  = mealCarbs[0] ? mealCarbs[0].doc : {}
    var tempprot  = mealProts[0] ? mealProts[0].doc : {}
    var tempfat  = mealFats[0] ? mealFats[0].doc : {}

    tempmeal.push(tempcal);
    tempmeal.push(tempcarb);
    tempmeal.push(tempprot);
    tempmeal.push(tempfat);

    for (let i = 0; i < tempmeal.length; i++) {
      // console.log("tempmeal.length",tempmeal.length);
      
      let checkfood = await query.findOne(mealcombocoll, { mainmeal_id : tempmeal[i]._id });
      // console.log("checkfood---",checkfood);
      if(checkfood){

        let submeal_id = checkfood.submeal_id
        let getfood = await query.findOne(Meal, { _id : submeal_id });
        let findcategory = getfood.category

        if(findcategory == "Protein"){
          var recal = getfood 
        }
        if(findcategory == "Carb" || findcategory == "F-Carb"){
          var recarb  = getfood 
        }
        if(findcategory == "Fats"){
          var reprot  = getfood 
        }
        if(findcategory == "Carb, Fruit" || findcategory == "F-Carb"){
          var refat  = getfood
        }

      }

      var cal  = { calories : recal ? recal : tempmeal[0] }
      var carb  = { carbs : recarb ? recarb : tempmeal[1] }
      var prot  = { proteins : reprot ? reprot : tempmeal[2] }
      var fat  = { fats : refat ? refat : tempmeal[3] }
      
    }
    var totalCal = (cal.calories.cal) + (carb.carbs.cal) + (prot.proteins.cal) + (fat.fats.cal);
    var totalCarbo = (cal.calories.carbs) + (carb.carbs.carbs) + (prot.proteins.carbs) + (fat.fats.carbs);
    var totalProt = (cal.calories.prot) + (carb.carbs.prot) + (prot.proteins.prot) + (fat.fats.prot);
    var totalFats = (cal.calories.fats) + (carb.carbs.fats) + (prot.proteins.fats) + (fat.fats.fats);
    var CarboPer = ((totalCarbo * 4) / totalCal).toFixed(2) * 100;
    var ProtPer = ((totalProt * 4) / totalCal).toFixed(2) * 100;
    var FatsPer = ((totalFats * 9) / totalCal).toFixed(2) * 100;
    var totalObj = { totalCal , totalCarbo , totalProt , totalFats , CarboPer, ProtPer, FatsPer }
    //console.log("totalObj",totalObj);
    var total = { total : totalObj }
    
    meal.push(cal);
    meal.push(carb);
    meal.push(prot);
    meal.push(fat);
    meal.push(total);

    // console.log("meal--",meal);
    // console.log("meal",meal.length);

    return meal;

  } catch (err) {
    var message = err.message;
    // console.log(message);
    
    if(message == "Cannot read property 'doc' of undefined"){
      message = "Sorry! No Meal Available for this Diet category. Please change your diettype."
    }
    throw Error(message)
  }
}

// swap meal food api query
exports.swapmeal = async function (dietfilter, mealVal, mealCat, foodId, foodName, foodCategory) {
    
  try {
    var foodId = foodId;
    var foodName = foodName;
    var foodCategory = foodCategory;
    var mealArr = [];
    var limit;
    if(foodCategory == "Fats"){
      limit = 40
    }
    else if(foodCategory == "Protein"){
      limit = 15
    }
    else if(foodCategory == "Carb, Fruit" || foodCategory == "F-Carb"){
      limit = 20
    }
    else{
      limit = 10
    }

    if(foodCategory == "Fats"){

      var meal = await Meal.aggregate([
        { $match: dietfilter },
        { $project: { diff: { $abs: { $subtract: [mealVal,{ $sum: [ mealCat , "0.1" ] } ] } }, doc: '$$ROOT' } },
        { $sort: { diff: 1 } },
        { $group: {_id: "$doc.grocery_list_name", foodid : { $first: "$doc._id" } , mediterranean : { $first: "$doc.mediterranean" } , paleo : { $first: "$doc.paleo" } , name : { $first: "$doc.name" }
        , grocery_list_name : { $first: "$doc.grocery_list_name" }, category : { $first: "$doc.category" } , size : { $first: "$doc.size" } , image_name : { $first: "$doc.image_name" } , cal : { $first: "$doc.cal" }
        , fats : { $first: "$doc.fats" } , carbs : { $first: "$doc.carbs" } , fiber : { $first: "$doc.fiber" }, prot : { $first: "$doc.prot" } , sodium : { $first: "$doc.sodium" }
        , sugar : { $first: "$doc.sugar" }, meal1 : { $first: "$doc.meal1" }, meal2 : { $first: "$doc.meal2" }, meal3 : { $first: "$doc.meal3" }, meal4 : { $first: "$doc.meal4" }
        , meal5 : { $first: "$doc.meal5" }, meal6 : { $first: "$doc.meal6" } } },
        { $limit: limit }
      ])

    }
    else{

      var meal = await Meal.aggregate([
        { $match: dietfilter },
        { $project: { diff: { $abs: { $subtract: [mealVal,{ $sum: [ mealCat , "0.1" ] } ] } }, doc: '$$ROOT' } },
        { $sort: { diff: 1 } },
        { $group: { _id: "$doc.grocery_list_name", foodid : { $first: "$doc._id" } , mediterranean : { $first: "$doc.mediterranean" } , paleo : { $first: "$doc.paleo" } , name : { $first: "$doc.name" }
        , grocery_list_name : { $first: "$doc.grocery_list_name" } , category : { $first: "$doc.category" } , size : { $first: "$doc.size" } , image_name : { $first: "$doc.image_name" } , cal : { $first: "$doc.cal" }
        , fats : { $first: "$doc.fats" } , carbs : { $first: "$doc.carbs" } , fiber : { $first: "$doc.fiber" }, prot : { $first: "$doc.prot" } , sodium : { $first: "$doc.sodium" }
        , sugar : { $first: "$doc.sugar" }, meal1 : { $first: "$doc.meal1" }, meal2 : { $first: "$doc.meal2" }, meal3 : { $first: "$doc.meal3" }, meal4 : { $first: "$doc.meal4" }
        , meal5 : { $first: "$doc.meal5" }, meal6 : { $first: "$doc.meal6" } } },
        { $limit: limit }
      ])

    }

    if(meal.length > 0){
      for (let i = 0; i < meal.length; i++) {
        var element = meal[i];
        var obj = {
          _id : element.foodid,
          mediterranean : element.mediterranean,
          paleo : element.paleo,
          name : element.name,
          grocery_list_name : element.grocery_list_name,
          category : element.category,
          size : element.size,
          image_name : element.image_name,
          cal : element.cal,
          fats : element.fats,
          carbs : element.carbs,
          fiber : element.fiber,
          prot : element.prot,
          sodium : element.sodium,
          sugar : element.sugar,
          meal1 : element.meal1,
          meal2 : element.meal2,
          meal3 : element.meal3,
          meal4 : element.meal4,
          meal5 : element.meal5,
          meal6 : element.meal6
        }
        mealArr.push(obj);
      }
    }
    var temp  = mealArr;
    //console.log("temp---",temp);
    return temp;

  } catch (err) {
    throw Error(err.message)
  }
}

// push notification
exports.pushNotification = async function (device_token,message,title,type) {
  // console.log("deviceToken",device_token);

  var payload = {
   data: {
     title: title,
     body: message,
     type: type
   }
 };
//  console.log("payload",payload);

 admin.messaging().sendToDevice(device_token, payload)
  .then(function(response) {
    // console.log("in responce");
    // console.log(response.results[0].error);
    // console.log("response-",response);
  })
  .catch(function(error) {
    // console.log("in catch");
    // console.log(error);
  });
}

// push notification
exports.logoutPushNotification = async function (device_token,message,title,type) {
  console.log("deviceToken",device_token);

  var payload = {
   data: {
     title: title,
     body: message,
     type : type
   }
 };
 console.log("payload",payload);

 admin.messaging().sendToDevice(device_token, payload)
  .then(function(response) {
    console.log("in responce");
    console.log(response.results[0].error);
    console.log("response-",response);
  })
  .catch(function(error) {
    console.log("in catch");
    console.log(error);
  });
}

// block notification 
exports.pushBlockNotification = async function (device_token,message,title,type) {
  console.log("deviceToken",device_token);

  var payload = {
   notification: {
     title: title,
     body: message
   },
   data : {
    type : type
   }
 };
 console.log("payload",payload);

 admin.messaging().sendToDevice(device_token, payload)
  .then(function(response) {
    console.log(response.results[0].error);
    console.log("response-",response);
  })
  .catch(function(error) {
    console.log(error);
  });
}

exports.getUsers = async function (query) {

  try {
    var userdata = await User.find(query).sort({ "created_at": -1 });
    // console.log(userdata);
    return userdata;

  } catch (e) {
    // Log Errors
    throw Error('Error  while getting user ' + e)
  }
}

exports.register = async function (body) {

  try {

    var createduserdata = new User(body);

    // if (createduserdata.password != '') {
    //   createduserdata.password = Bcrypt.hashSync(createduserdata.password, 8);
    // }

    await createduserdata.save();

    createduserdata = JSON.parse(JSON.stringify(createduserdata));

    createduserdata.authToken = jwt.sign(createduserdata, process.env.decryptSecret, {
      expiresIn: 1440 * 60 * 30
    });

    return createduserdata;
  } catch (err) {
    // Log Errors
    throw Error('Error while registering user ' + err.message)
  }
}

exports.insertDetail = async function (body, Model) {

  try {
    var model = mongoose.model(Model);
    let data = new model(body);
    data.save();
    return data;

  } catch (e) {
    // Log Errors
    throw Error('Error while inserting data ' + e)
  }
}

exports.deleteUser = async function (query) {

  try {
    var data = await User.deleteOne(query);

    return data;

  } catch (e) {
    // Log Errors
    throw Error('Error while deleting data ' + e)
  }
}

exports.userData = async function (user) {

  try {

    let loginuser = {
      authId: user._id,
      name: user.name,
      dob: user.dob,
      age: user.age,
      gender: user.gender,
      email: user.email,
      countrycode : user.countrycode,
      mobilenumber: user.mobilenumber,
      weight : user.weight ? user.weight : 0,
      weightType : user.weightType,
      bodyfat: user.bodyfat ? user.bodyfat : 0,
      lbm : user.lbm ? user.lbm : 0,
      bmr: user.bmr ? user.bmr : 0,
      login_type : user.login_type,
      social_key : user.social_key,
      bodytype: user.body.bodytype ? user.body.bodytype : "",
      carbs: user.body.carbs ? user.body.carbs : 0,
      protein: user.body.protein ? user.body.protein : 0,
      fat: user.body.fat ? user.body.fat : 0,
      workouttype: user.workout.workouttype ? user.workout.workouttype : "",
      workpercentage: user.workout.workpercentage ? user.workout.workpercentage : 0.0,
      diettype : user.diettype ? user.diettype : 0,
      goal: user.goal ? user.goal : 0,
      leveltype: user.level.leveltype ? user.level.leveltype : "",
      levelpercentage: user.level.levelpercentage ? user.level.levelpercentage : 0,
      isActive : user.isActive,
      device_token : user.device_token,
      device_type : user.device_type,
      isNotification : user.isNotification,
      plantdetails : user.plantdetails ? user.plantdetails : "",
      isPremium : user.isPremium
    };

    loginuser.authToken = jwt.sign(loginuser, process.env.decryptSecret, {
      expiresIn: 1440 * 60 * 30 // expires in 24 hours
    });

    return loginuser;
  } catch (e) {
    // Log Errors
    throw Error('Error ' + e)
  }
}

//To match password
exports.match_password = async function (password, db_password) {
  if (!Bcrypt.compareSync(password, db_password)) {
    return 1;
  }
  else {
    return 0;
  }
}

exports.updateUser = async function (filter, query) {

  try {
    //console.log(User.update(filter, query));
    var user = await User.updateOne(filter, query);
    return user;


  } catch (e) {
    // Log Errors
    throw Error('Error while updating user' + e)
  }
}
