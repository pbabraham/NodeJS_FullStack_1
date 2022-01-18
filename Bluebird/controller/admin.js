const { responseModel } = require('../model');
const { query, userQuery } = require('../query');
const mongoose = require('mongoose');
const moment = require('moment');
const _ = require("lodash");
const fs = require('fs');
const MomentRange = require("moment-range");
const daterange = MomentRange.extendMoment(moment);
const AWS = require('aws-sdk');
const ID = process.env.aws_access_id;
const SECRET = process.env.aws_secret_key;
const ProfileBucket = 'mealuserprofilephoto';
const MealplanPdfBucket = 'mealpdfs';
const MealplanGorBucket = 'mealgrocerie';
const MealFoodBucket = 'mealfood';
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});
  let Exercises = require('../public/exerciseData.js')

/* SERVICES */
var UserService = require('../service/userService');
var AdminService = require('../service/adminService');
const { fileUpload } = require('../service');
const { commonService } = require('../service');

/* MODEL */
let collection = mongoose.model('user');
let cmscoll = mongoose.model('cms');
let mealcoll = mongoose.model('meal');
let usermealcoll = mongoose.model('usermeal');
let mealcombocoll = mongoose.model('mealcombo');
let premiumplancoll = mongoose.model('premiumplan');
let userphotocoll = mongoose.model('userphoto');
let exercisecoll = mongoose.model('exercise')

exports.login = async function (req){
    try {
    
        let user = await userQuery.getadmin(req);
        if (!(user && user.authId)) {
            return responseModel.notFound("Invalid credentials ", user);
        } else {
            return responseModel.successResponse("login successfully", user);
        }
    } catch (err) {
        errMessage = typeof err == 'string' ? err : err.message;
        return responseModel.failResponse("Error while getting user profile: " + errMessage);
    }
}
 
exports.getAllUser = async function (req) {
    try {
        // let pageNo = parseInt(req.query.pageNo);
        // let limit = parseInt(req.query.limit);
        let searchText = req.query.searchText;
        let filter = { isAdmin : false };
  
      // if (pageNo < 0 || pageNo === 0) {
      //   return responseModel.successResponse("invalid page number, should start with 1");
      // }
  
      let searchTextObj = [{
        $or: [
          { 'name': new RegExp('^' + searchText, 'i') },
          { "email": new RegExp('^' + searchText, 'i') },
          { "mobilenumber": new RegExp('^' + searchText, 'i') }
        ]
      }]
  
      searchText ? filter.$or = searchTextObj : null;
      let QueryArray = [{ $match: filter },
      // {
      //   $facet: {
      //     userList: [{ $skip: limit * (pageNo - 1) }, { $limit: limit }],
      //     totalCount: [
      //       { $count: 'count' }
      //     ]
      //   }
      // }
      ]

      let users = await query.aggregate(collection, QueryArray);
      
      userList = JSON.parse(JSON.stringify(users))
      var result = _.map(userList, object => {return _.omit(object, 'lbmarr','bmrarr','bodyfatarr','weightarr','userphoto','mealpercentage')});
      //console.log(result);
     
      // users = { user_list: users[0].userList, totalcount: users[0].totalCount[0] ? users[0].totalCount[0].count : 0 }
      return responseModel.successResponse("user list get successfully.", result);
    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while getting user list: " + errMessage);
    }
}
  

exports.getUserById = async function (req) {
    try {
      let getuser = await query.findOne(collection, { _id: req.params.user_id });
      return responseModel.successResponse("user profile ", getuser);
    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while getting user profile: " + errMessage);
    }
}
  
exports.updateUser = async function (req) {
    try {
  
      update = {
        name: req.body.name,
        email: req.body.email,
        mobilenumber: req.body.mobilenumber,
        updateAt: Date.now()
      }
  
      let checkuser = await query.findOne(collection, { $and: [  { _id : { $ne: req.body.user_id } } , {email : req.body.email } ] });
      if(checkuser){
        return responseModel.failResponse("The email address you have entered already registerd.");
      }
  
      let user = await query.findOneAndUpdate(collection, { _id: req.body.user_id }, { $set: update });
      return responseModel.successResponse("user updated successfully", user);
    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while updating user data: " + errMessage);
    }
}

exports.deleteUser = async function (req) {
    try {
      // unlink mealpdf , grocerypdf
      var userId = req.params.user_id;
      let searchuser = await query.findOne(collection, { _id: req.params.user_id });
      var dir = userId + "/";
      const ProfileBucket = 'mealuserprofilephoto';
      await emptyS3Directory(ProfileBucket, dir)
      let user = await query.deleteOne(collection, { _id: req.params.user_id });
      let usermeal = await query.deleteMany(usermealcoll, { user_id : req.params.user_id });
      let userphoto = await query.deleteMany(userphotocoll, { user_id : req.params.user_id });
      return responseModel.successResponse("User account deleted successfully.",user);

    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while deleting user account: " + errMessage);
    }
}


//uploadExerciseImages
exports.uploadExerciseImages = async function (req){
  console.log(Exercises.length)
try {
let result = Exercises.length
   for(i=0; i<Exercises.length; i++){
     await query.insert(exercisecoll, {
      exerciseId : i+1,
      description : Exercises[i]['Specific Motion'],
      metValue : Exercises[i].MET,
      exerciseIcon : Exercises[i].Icon+".png"
     })
   }
    return responseModel.successResponse("exercises uploaded.",result);
 
  
} catch (error) {
  errMessage = typeof err == 'string' ? err : err.message;
  return responseModel.failResponse("Error while uploading exercise: " + errMessage);
}
}



async function emptyS3Directory(bucket, dir) {
  const listParams = {
      Bucket: bucket,
      Prefix: dir
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
      Bucket: bucket,
      Delete: { Objects: [] }
  };

  listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
}

exports.deletebulkUser = async function (req) {
  try {
    //console.log("array",req.body.userarray)
    let deleteuser = await query.deleteMany(collection,{_id: { $in: req.body.userarray}});

    let searchuser = await query.findOne(collection, { _id: req.params.user_id });
    let userimage = _.map(searchuser.userphoto,'photourl');
    await fileUpload.bulkdeleteuserprofile(userimage)
    let user = await query.deleteOne(collection, { _id: req.params.user_id });
    let usermeal = await query.deleteOne(usermealcoll, { user_id : req.params.user_id });
    return responseModel.successResponse("user account deleted successfully.",user);
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message;
    return responseModel.failResponse("Error while deleting user account: " + errMessage);
  }
}
  
exports.userStatus = async function (req) {
    try {
    
        let finduser = await query.findOne(collection,{ _id: req.body.user_id });
        let user_devicetoken = finduser.device_token;

        let user = await query.findOneAndUpdate(collection, { _id: req.body.user_id }, 
            { "$set": { isActive: req.body.status }} );

            if(req.body.status == false){

                var device_token = user_devicetoken;
                var message = "Hey " + finduser.name + ", Your Account Blocked By Admin";
                var title = "Meal Plan";
                var type = "auto_logout";
        
                UserService.pushBlockNotification( device_token, message, title , type);
        
            }    

        return responseModel.successResponse("user status upadte successfully.");
    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while updating user status: " + errMessage);
    }
}

//-------- Mnage Food Combination -------------

exports.addmealCombination = async function (req) {
  try {

    let mainmeal_id = req.body.mainmeal;
    let submeal_id = req.body.submeal;

    if(mainmeal_id == submeal_id){
      return responseModel.failResponse("You can not make same food combination, please choose different one.");
    }

    let filter = { $and: [ { mainmeal_id : mongoose.Types.ObjectId(mainmeal_id) }, { submeal_id : mongoose.Types.ObjectId(submeal_id) } ] }

    let aggregateArr = [{ $match: filter }];

    let checkcombo = await query.aggregate(mealcombocoll,aggregateArr);
    //console.log(checkcombo);
    
    if(checkcombo.length > 0){
      return responseModel.failResponse("This food combination already exists, please try different one.");
    }
    else{
      let data = {
        mainmeal_id : mainmeal_id,
        submeal_id : submeal_id
      }
  
      let addmealcombo = await query.insert(mealcombocoll,data);
  
      return responseModel.successResponse("meal combo added successfully.", addmealcombo);
    }
  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message;
    return responseModel.failResponse("Error while adding meal combination: " + errMessage);
  }
}

exports.getCombination = async function (req){
  
}

//-------- Analytics --------------------------

exports.planAnalytics = async function (req) {
    try {
    
        let users = await query.find(collection,{});
        let dietarray = _.map(users,'diettype');
        let totaldiet = _.size(dietarray);
        let analytics = _.countBy(dietarray, Math.floor);
        //console.log(analytics);

        var paleo = (analytics[1] / totaldiet) * 100;
        var mediterranean = (analytics[2] / totaldiet) * 100;
        var noprefrence = (analytics[3] / totaldiet) * 100;
        // console.log(paleo);
        // console.log(mediterranean);
        // console.log(noprefrence);

        var finalanalytic = {
          "Paleo" : Math.round(paleo),
          "Mediterranean" : Math.round(mediterranean),
          "No preference" : Math.round(noprefrence),
        }
     
      return responseModel.successResponse("User diet plan analytics",finalanalytic);
    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while generating user diet plan analytics: " + errMessage);
    }
}

exports.analyticsWeightGain = async function (req) {
  try {
    
    var startdate = req.body.startdate;
    var enddate = req.body.enddate;
    var mstartdate = moment(startdate).format('YYYY-MM-DD');
    var menddate = moment(enddate).format('YYYY-MM-DD');
    var groupby = req.body.groupby; // 1 - weekly , 2 - monthly , 3 - quarterly , 4 - yearly
    let users = await query.find(collection,{"goal" : 2});
    var userlen = users.length;
    var dtrange = daterange.range(mstartdate, menddate);
    var arr = [];
    var finalarr = [];
    var finalresult = [];
    let Xarray;
    // console.log(mstartdate);
    // console.log(menddate);
    //console.log(users);
    
    
    for (let i = 0; i < users.length; i++) {
      //weekly
      if(groupby == 1){
        let filter = {
          $and: [
            { _id : mongoose.Types.ObjectId(users[i]._id) },
            { "weightarr.date": { $gte: new Date(startdate), $lte: new Date(enddate) } }
          ]
        }
        
        let aggregateArr = [
          { $unwind: '$weightarr'},
          { $match: filter },
          { $group : { 
            _id : { week: { $week: '$weightarr.date' }, year : { $year : '$weightarr.date'} },
            userweight : { $avg : '$weightarr.userweight' } } },
          { $sort : { "_id.week" : 1 , "_id.year" : 1 }}
        ];
      
        let result = await query.aggregate(collection,aggregateArr);
         //console.log("res--",result);
         for (let i = 0; i < result.length; i++) {
          var object = { week : result[i]._id.week , year : result[i]._id.year , userweight : result[i].userweight }
          // mainarr.push(result[i])
          arr.push(object);
        }
      }
      //monthly
      if(groupby == 2) {

        let filter = {
          $and: [
            { _id : mongoose.Types.ObjectId(users[i]._id) },
            { "weightarr.date": { $gte: new Date(startdate), $lte: new Date(enddate) } }
          ]
        }
        
        let aggregateArr = [
          { $unwind: '$weightarr'},
          { $match: filter },
          { $group : { 
            _id : { month : { $month : '$weightarr.date' }, year : { $year : '$weightarr.date'} },
            userweight : { $avg : '$weightarr.userweight' } } },
          { $sort : { "_id.month" : 1 , "_id.year" : 1 }}
        ];
      
        let result = await query.aggregate(collection,aggregateArr);
        //console.log("res--",result);
        for (let i = 0; i < result.length; i++) {
          var object = { month : result[i]._id.month , year : result[i]._id.year , userweight : result[i].userweight }
          // mainarr.push(result[i])
          arr.push(object);
        }
      }
      //quarterly
      if(groupby == 3){

        let filter = {
          $and: [
            { _id : mongoose.Types.ObjectId(users[i]._id) },
            { "weightarr.date": { $gte: new Date(startdate), $lte: new Date(enddate) } }
          ]
        }

        let aggregateArr = [
          { $unwind: '$weightarr'},
          { $match: filter },
          { $project:{"weightarr":1, 
                      "quarter": { $cond:[{$lte:[{$month:'$weightarr.date'},3 ]},"first",
                                 { $cond:[{$lte:[{$month:'$weightarr.date'},6 ]},"second",
                                 { $cond:[{$lte:[{$month:'$weightarr.date'},9 ]},"third","fourth"]}]}]}}
          },
          { $group:{"_id":{"quarter":"$quarter"}, "userweight" : { $avg : "$weightarr.userweight" } } },
          { $sort :  { "_id.quarter": 1 }}
        ];

        let result = await query.aggregate(collection,aggregateArr);
        // console.log("---",result);
        for (let i = 0; i < result.length; i++) {
          var object = { quarter : result[i]._id.quarter , userweight : result[i].userweight }
          // mainarr.push(result[i])
          arr.push(object);
        }
      }
      //yearly
      if(groupby == 4){
        let filter = {
          $and: [
            { _id : mongoose.Types.ObjectId(users[i]._id) },
            { "weightarr.date": { $gte: new Date(startdate), $lte: new Date(enddate) } }
          ]
        }
        
        let aggregateArr = [
          { $unwind: '$weightarr'},
          { $match: filter },
          { $group : { 
            _id : { year : { $year : '$weightarr.date'} },
            userweight : { $avg : '$weightarr.userweight' } } },
          { $sort : { "_id.year" : 1 }}
        ];
      
        let result = await query.aggregate(collection,aggregateArr);
         //console.log("res--",result);
         for (let i = 0; i < result.length; i++) {
          var object = { year : result[i]._id.year , userweight : result[i].userweight }
          // mainarr.push(result[i])
          arr.push(object);
        }
      }

    }

    // console.log("arr-- ",arr);
    if(groupby == 1){
      
      const reducer = (group, current) => {
        let i = group.findIndex(single => (single.year == current.year && single.week == current.week));
        if (i == -1) {
          return [ ...group, current ];
        }
    
        group[i].userweight += current.userweight;
        return group;
      };

      const userresult = arr.reduce(reducer, []);
      //console.log("result---",userresult);

      for (let j = 0; j < userresult.length; j++) {
        var object = { week : userresult[j].week,
                       year : userresult[j].year ,
                      userweight : userresult[j] ? userresult[j].userweight/userlen : 0 }
        finalarr.push(object);
    }

    Xarray = Array.from(dtrange.by("weeks"));

      if (Xarray && Xarray.length > 0) { 
        let X = Xarray.map(m => {
          return m.format("YYYY-MM-DD");
        });

        // console.log(X);
        // console.log(finalarr);

        _.map(X, function(obj) {
          let Week = moment(obj).week();
          let Year = moment(obj).year();
          let dayObj = _.find(finalarr, { week : Week, year: Year });

          finalresult.push({
            Weight : dayObj && dayObj.userweight ? Math.round(dayObj.userweight) : 0,
            week : moment().year(Year).week(Week).day("sunday").format("YYYY-MM-DD")
          })
        })
      }

    }

    if(groupby == 2){

      const reducer = (group, current) => {
        let i = group.findIndex(single => (single.year == current.year && single.month == current.month));
        if (i == -1) {
          return [ ...group, current ];
        }
    
        group[i].userweight += current.userweight;
        return group;
      };

      const userresult = arr.reduce(reducer, []);
      // console.log("result---",userresult);
      for (let j = 0; j < userresult.length; j++) {
        var object = { month : userresult[j].month , 
                        year : userresult[j].year ,
                        userweight : userresult[j] ? Math.round(userresult[j].userweight/userlen) : 0 }
        finalarr.push(object);
      }

      Xarray = Array.from(dtrange.by("month"));

      if (Xarray && Xarray.length > 0) { 
        let X = Xarray.map(m => {
          return m.format("YYYY-MM-DD");
        });

        // console.log(X);
        // console.log(finalarr);
        
        _.map(X, function(obj) {
          let Month = moment(obj).month();
          let Year = moment(obj).year();
          let dayObj = _.find(finalarr, { month : Month + 1, year: Year });

          finalresult.push({
            Weight : dayObj && dayObj.userweight ? Math.round(dayObj.userweight) : 0,
            month : moment().year(Year).month(Month).format("YYYY-MM")
          })
        }) 
      }
    }

    if(groupby == 3){

      const reducer = (group, current) => {
        let i = group.findIndex(single => (single.quarter == current.quarter));
        if (i == -1) {
          return [ ...group, current ];
        }
    
        group[i].userweight += current.userweight;
        return group;
      };
      const userresult = arr.reduce(reducer, []);
      //console.log("result---",userresult);

      for (let j = 0; j < userresult.length; j++) {
       var object = { quarter : userresult[j].quarter, userweight : userresult[j] ? userresult[j].userweight/userlen : 0 }
        finalarr.push(object);
      }
      
      var quarterarr = ["first" , "second" , "third" , "fourth"]

      for (let k = 0; k < quarterarr.length; k++) {
        
        let dayObj = _.find(finalarr, {  quarter : quarterarr[k] });

          finalresult.push({
            Weight : dayObj && dayObj.userweight ? Math.round(dayObj.userweight) : 0,
            quarter : quarterarr[k]
          })
        
      }
    }

    if(groupby == 4){

      const reducer = (group, current) => {
        let i = group.findIndex(single => (single.year == current.year));
        if (i == -1) {
          return [ ...group, current ];
        }
    
        group[i].userweight += current.userweight;
        return group;
      };
      const userresult = arr.reduce(reducer, []);
      // console.log("result---",userresult);

    for (let j = 0; j < userresult.length; j++) {
      var object = { year : userresult[j].year , userweight : userresult[j] ? userresult[j].userweight/userlen : 0 }
      finalarr.push(object);
    }

    Xarray = Array.from(dtrange.by("years"));

      if (Xarray && Xarray.length > 0) { 
        let X = Xarray.map(m => {
          return m.format("YYYY-MM-DD");
        });
        
        _.map(X, function(obj) {
          let Month = moment(obj).month();
          let Year = moment(obj).year();
          let dayObj = _.find(finalarr, { year: Year });

          finalresult.push({
            Weight : dayObj && dayObj.userweight ? Math.round(dayObj.userweight) : 0,
            year : moment().year(Year).format("YYYY")
          })
        }) 
      }
    }

   //console.log("finalarr---",finalarr);
    
  return responseModel.successResponse("Analytics of average weigh gain.",finalresult);
} catch (err) {
  errMessage = typeof err == 'string' ? err : err.message;
  return responseModel.failResponse("Error while generating analytics of average weigh gain: " + errMessage);
 }
}

exports.analyticsWeightLoss = async function (req) {
  try {
    var startdate = req.body.startdate;
    var enddate = req.body.enddate;
    var groupby = req.body.groupby; // 1 - weekly , 2 - monthly , 3 - quarterly , 4 - yearly
    var category = req.body.category; //1 - weight ,2 - bodyfat ,3 - bmr , 4 - lbm
    var dtrange = daterange.range(startdate, enddate);
    var arr = [];
    var finalarr = [];
    var finalresult = [];
    var filterarr;
    var filtertext;
    var displaytext;
    let GroupBy;

    let users = await query.find(collection,{"goal" : 3});
    var userlen = users.length;

    //console.log("userlen",userlen);
    for (let i = 0; i < users.length; i++) {

      if(category == 1){
        filterarr = "weightarr",
        filtertext = "userweight",
        displaytext = "Weight"
      }
      if(category == 2){
        filterarr = "bodyfatarr",
        filtertext = "userbodyfat",
        displaytext = "Bodyfat"
      }
      if(category == 3){
        filterarr = "bmrarr",
        filtertext = "userbmr",
        displaytext = "BMR"
      }
      if(category == 4){
        filterarr = "lbmarr",
        filtertext = "userlbm",
        displaytext = "LBM"
      }

      //weekly
      if(groupby == 1){

        GroupBy = {
          week: { $week: "$" + filterarr + ".date" },
          year: { $year: "$" + filterarr + ".date" }
        };

        //console.log("GroupBy",GroupBy);
        let filterval = filterarr + ".date"

        let filter = {
          $and: [
            { _id : mongoose.Types.ObjectId(users[i]._id) },
            { [filterval] : { $gte: new Date(startdate), $lte: new Date(enddate) } }
          ]
        }
        
        let aggregateArr = [
          { $unwind: '$' + filterarr},
          { $match: filter },
          { $group : { 
            _id : GroupBy,
            [filtertext] : { $avg : '$' + filterarr + '.' + filtertext } } },
          { $sort : { "_id.week" : 1 , "_id.year" : 1 }}
        ];

        //console.log(aggregateArr);
      
        let result = await query.aggregate(collection,aggregateArr);
        // console.log("res--",result);
    
        for (let i = 0; i < result.length; i++) {
          var object = { week : result[i]._id.week , year : result[i]._id.year , [filtertext] : result[i][filtertext] }
          arr.push(object);
        }
      }
      //monthly
      if(groupby == 2) {

        GroupBy = {
          month: { $month: "$" + filterarr + ".date" },
          year: { $year: "$" + filterarr + ".date" }
        };

        //console.log("GroupBy",GroupBy);
        let filterval = filterarr + ".date";
        
        let filter = {
          $and: [
            { _id : mongoose.Types.ObjectId(users[i]._id) },
            { [filterval] : { $gte: new Date(startdate), $lte: new Date(enddate) } }
          ]
        }
        
        let aggregateArr = [
          { $unwind: '$' + filterarr},
          { $match: filter },
          { $group : { 
            _id : GroupBy,
            [filtertext] : { $avg : '$' + filterarr + '.' + filtertext }
          } },
          { $sort : { "_id.month" : 1 , "_id.year" : 1 }}
        ];

      //console.log(aggregateArr);
    
      let result = await query.aggregate(collection,aggregateArr);
      //console.log("res--",result);

        for (let i = 0; i < result.length; i++) {
          var object = { month : result[i]._id.month , year : result[i]._id.year , [filtertext] : result[i][filtertext] }        
          arr.push(object);
        }
      }
      //quarterly
      if(groupby == 3){

        let filterval = filterarr + ".date";

        let filter = {
          $and: [
            { _id : mongoose.Types.ObjectId(users[i]._id) },
            { [filterval]: { $gte: new Date(startdate), $lte: new Date(enddate) } }
          ]
        }

        let aggregateArr = [
          { $unwind: '$' + filterarr},
          { $match: filter },
          { $project:{ [filterarr] : 1, 
                      "quarter": { $cond:[{$lte:[{$month:'$' + filterval },3 ]},"first",
                                 { $cond:[{$lte:[{$month:'$' + filterval},6 ]},"second",
                                 { $cond:[{$lte:[{$month:'$' + filterval},9 ]},"third","fourth"]}]}]}}
          },
          { $group:{"_id":{"quarter":"$quarter"}, [filtertext] : { $avg : '$' + filterarr + '.' + filtertext } } },
          { $sort :  { "_id.quarter": 1 }}
        ];
      
      //console.log(aggregateArr);

      let result = await query.aggregate(collection,aggregateArr);
      //console.log("res--",result);

      for (let i = 0; i < result.length; i++) {
          var object = { quarter : result[i]._id.quarter , [filtertext] : result[i][filtertext] }
          arr.push(object);
        }
      }
      //yearly
      if(groupby == 4){

        GroupBy = { year: { $year: "$" + filterarr + ".date" } };

        //console.log("GroupBy",GroupBy);
        let filterval = filterarr + ".date";

        let filter = {
          $and: [
            { _id : mongoose.Types.ObjectId(users[i]._id) },
            { [filterval] : { $gte: new Date(startdate), $lte: new Date(enddate) } }
          ]
        }
        
        let aggregateArr = [
          { $unwind: '$' + filterarr},
          { $match: filter },
          { $group : { 
            _id : GroupBy,
            [filtertext] : { $avg : '$' + filterarr + '.' + filtertext } } },
          { $sort : { "_id.year" : 1 }}
        ];

        //console.log(aggregateArr);
      
        let result = await query.aggregate(collection,aggregateArr);
        //console.log("res--",result);
      
        for (let i = 0; i < result.length; i++) {
          var object = { year : result[i]._id.year , [filtertext] : result[i][filtertext] };
          arr.push(object);
        }
      }

    }

  //console.log("arr--",arr);

  if(groupby == 1){
      Xarray = Array.from(dtrange.by("weeks"));
    
      const reducer = (group, current) => {
        let i = group.findIndex(single => (single.year == current.year && single.week == current.week));
        if (i == -1) {
          return [ ...group, current ];
        }
    
        group[i][filtertext] += current[filtertext];
        return group;
      };
      const userresult = arr.reduce(reducer, []);
      //console.log("result---",userresult);

    for (let j = 0; j < userresult.length; j++) {
      var object = { week : userresult[j].week,
                     year : userresult[j].year,
                     [filtertext] : userresult[j] ? userresult[j][filtertext]/userlen : 0 }
      finalarr.push(object);
    }
    //console.log("finalarr---",finalarr);
    
    Xarray = Array.from(dtrange.by("weeks"));

    if (Xarray && Xarray.length > 0) {
      let X = Xarray.map(m => {
        return m.format("YYYY-MM-DD");
      });

      // console.log(X);
      // console.log(finalarr);

      _.map(X, function(obj) {
        let Week = moment(obj).week();
        let Year = moment(obj).year();
        let dayObj = _.find(finalarr, { week : Week - 1, year: Year });

        finalresult.push({
          [displaytext] : dayObj && dayObj[filtertext] ? Math.round(dayObj[filtertext]) : 0,
          week : moment().year(Year).week(Week).day("sunday").format("YYYY-MM-DD")
        })
      })
    }

  }

  if(groupby == 2){

      const reducer = (group, current) => {
        let i = group.findIndex(single => (single.year == current.year && single.month == current.month));
        if (i == -1) {
          return [ ...group, current ];
        }
    
        group[i][filtertext] += current[filtertext];
        return group;
      };
      const userresult = arr.reduce(reducer, []);
      //console.log("result---",userresult);

    for (let j = 0; j < userresult.length; j++) {
      var object = { month : userresult[j].month , 
                     year : userresult[j].year ,
                     [filtertext] : userresult[j] ? userresult[j][filtertext]/userlen : 0 }
      finalarr.push(object);
    }
    //console.log("finalarr---",finalarr);

    Xarray = Array.from(dtrange.by("month"));

    if (Xarray && Xarray.length > 0) { 
      let X = Xarray.map(m => {
        return m.format("YYYY-MM-DD");
      });

      // console.log(X);
      // console.log(finalarr);
      
      _.map(X, function(obj) {
        let Month = moment(obj).month();
        let Year = moment(obj).year();
        let dayObj = _.find(finalarr, { month : Month + 1, year: Year });

        finalresult.push({
          [displaytext] : dayObj && dayObj[filtertext] ? Math.round(dayObj[filtertext]) : 0,
          month : moment().year(Year).month(Month).format("YYYY-MM")
        })
      }) 
    }
  }

  if(groupby == 3){

      const reducer = (group, current) => {
        let i = group.findIndex(single => (single.quarter == current.quarter));
        if (i == -1) {
          return [ ...group, current ];
        }
    
        group[i][filtertext] += current[filtertext];
        return group;
      };
      const userresult = arr.reduce(reducer, []);
      //console.log("result---",userresult);

      for (let j = 0; j < userresult.length; j++) {
       var object = { quarter : userresult[j].quarter, [filtertext] : userresult[j] ? userresult[j][filtertext]/userlen : 0 }
        finalarr.push(object);
      }
      //console.log("finalarr---",finalarr);

      var quarterarr = ["first" , "second" , "third" , "fourth"]

      for (let k = 0; k < quarterarr.length; k++) {
        
        let dayObj = _.find(finalarr, {  quarter : quarterarr[k] });

          finalresult.push({
            [displaytext] : dayObj && dayObj[filtertext] ? Math.round(dayObj[filtertext]) : 0,
            quarter : quarterarr[k]
          })
        
      }
  }

  if(groupby == 4){

      const reducer = (group, current) => {
        let i = group.findIndex(single => (single.year == current.year));
        if (i == -1) {
          return [ ...group, current ];
        }
    
        group[i][filtertext] += current[filtertext];
        return group;
      };
      const userresult = arr.reduce(reducer, []);
      // console.log("result---",userresult);

    for (let j = 0; j < userresult.length; j++) {
      var object = { year : userresult[j].year , [filtertext] : userresult[j] ? userresult[j][filtertext]/userlen : 0 }
      finalarr.push(object);
    }
    //console.log("finalarr---",finalarr);

    Xarray = Array.from(dtrange.by("years"));

    if (Xarray && Xarray.length > 0) { 
      let X = Xarray.map(m => {
        return m.format("YYYY-MM-DD");
      });
      
      _.map(X, function(obj) {
        let Month = moment(obj).month();
        let Year = moment(obj).year();
        let dayObj = _.find(finalarr, { year: Year });

        finalresult.push({
          [displaytext] : dayObj && dayObj[filtertext] ? Math.round(dayObj[filtertext]) : 0,
          year : moment().year(Year).format("YYYY")
        })
      }) 
    }
  }

  //console.log("finalresult---",finalresult);
  
  return responseModel.successResponse("Analytics of average weigh loss.",finalresult);
} catch (err) {
  errMessage = typeof err == 'string' ? err : err.message;
  return responseModel.failResponse("Error while generating analytics of average weigh loss: " + errMessage);
}
}

exports.createAdmin = async function (req) {
    let admin = {
      email: '',
      mobilenumber: '',
      name : "",
      isAdmin: true,
      password: '' 
    }
    return new Promise(function (resolve, reject) {
      query.findOne(collection, { email: admin.email }).then((user) => {
        if (user) {
          return resolve({ "code": 500, "message": "Admin Already Exits" })
        }
        query.insert(collection, admin).then((addAdmin) => {
          return resolve({ "code": 201, "message": "Admin Created", "data": addAdmin })
        }).catch(err => reject(err))
      }).catch(err => reject(err));
    })
}

exports.testapi = async function (req) {
  try {
    var test = req.body.testmeal;
    //console.log("---",test);
    
    // var data = {
    //   dob: req.body.dob,
    //   updateAt: Date.now()
    // };
    let user = await query.findOneAndUpdate(collection,
      { _id: req.authenticationUser.authId },
      { $push: { testmeal : test } }
      // {testmeal : test }
    );
    return responseModel.successResponse("updated", user.testmeal);

  } catch (err) {
    errMessage = typeof err == 'string' ? err : err.message;
    return responseModel.failResponse("Error while updating " + errMessage);
  }
}

//---- cms page managment ----

exports.cmsAdd = async function (req) {
    try {
        var cmsdata = {
            page_title : req.body.page_title,
            page_slug: req.body.page_slug,
            page_content : req.body.page_content
          };

        let cms = await query.insert(cmscoll,cmsdata);
      
        return responseModel.successResponse("cms data insert successfully.", cms);

    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while inserting cms data: " + errMessage);
    }
}

exports.cmsUpdate = async function (req) {
    try {
        var cmsdata = {
            page_title : req.body.page_title,
            page_slug: req.body.page_slug,
            page_content : req.body.page_content,
            updateAt : Date.now()
          };

        let cms = await query.findOneAndUpdate(cmscoll,{ page_slug : req.body.page_slug },{ $set: cmsdata });
      
        return responseModel.successResponse("cms data updated successfully.", cms);

    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while updating cms data: " + errMessage);
    }
}

exports.cmsList = async function (req) {
    try {

        let cms = await query.find(cmscoll,{});
      
        return responseModel.successResponse("cms data get successfully.", cms);

    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while getting cms data: " + errMessage);
    }
}

exports.cmsDelete = async function (req) {
    try {
      let cms = await query.deleteOne(cmscoll, { _id: req.params.cms_id });
      return responseModel.successResponse("cms deleted successfully.",cms);
    } catch (err) {
      errMessage = typeof err == 'string' ? err : err.message;
      return responseModel.failResponse("Error while deleting cms: " + errMessage);
    }
}