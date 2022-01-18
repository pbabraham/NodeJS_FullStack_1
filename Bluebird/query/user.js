
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { emailService } = require('../service');
let collection = mongoose.model('user');
let ObjectId = mongoose.mongo;
const CryptoJS = require("crypto-js");
const query = require('../query/query');
//const { query, userQuery } = require('../query');
var UserService = require('../service/userService');

//simple register
let insert = async (data) => {
    return new Promise((resolve, reject) => {
        let authdata = data
        let userfilter = { email : data.email }

        collection.findOne(userfilter, (err, list) => {
            if (err) {
                return reject({ message: "Error while creating user " + err });
            } else {
                if (list) {
                    if (data.email == list.email) {
                        // console.log("---")
                        return reject({ message: "EmailId already register" });
                    }
                }

                let account = new collection(authdata);
                account.password = account.generateHash(authdata.password);
                account.save(authdata, async (err, result) => {
                    if (err) return reject({ message: "Error while register user " + err});
                    let insertRow = {
                        authId: result._id,
                        name: result.name,
                        dob: result.dob,
                        age: result.age,
                        gender: result.gender,
                        email: result.email,
                        countrycode : result.countrycode,
                        mobilenumber: result.mobilenumber,
                        weight : result.weight ? result.weight : 0,
                        weightType : result.weightType,
                        bodyfat: result.bodyfat ? result.bodyfat : 0,
                        lbm : result.lbm ? result.lbm : 0,
                        bmr : result.bmr ? result.bmr : 0,
                        login_type : result.login_type,
                        social_key : result.social_key,
                        bodytype: result.body.bodytype ? result.body.bodytype : "",
                        carbs: result.body.carbs ? result.body.carbs : 0,
                        protein: result.body.protein ? result.body.protein : 0,
                        fat: result.body.fat ? result.body.fat : 0,
                        workouttype: result.workout.workouttype ? result.workout.workouttype : "",
                        workpercentage: result.workout.workpercentage ? result.workout.workpercentage : 0.0,
                        diettype : result.diettype ? result.diettype : 0,
                        goal: result.goal ? result.goal : 0,
                        leveltype: result.level.leveltype ? result.level.leveltype : "",
                        levelpercentage: result.level.levelpercentage ? result.level.levelpercentage : 0,
                        isActive : result.isActive,
                        device_token : result.device_token,
                        device_type : result.device_type,
                        isNotification : result.isNotification,
                        isPremium : result.isPremium
                    };
                    insertRow.authToken = jwt.sign(insertRow, process.env.decryptSecret , {
                        expiresIn: 1440 * 60 * 30 // expires in 24 hours
                    });
                    
                    return resolve(insertRow);
                })
            }

        });
    })
};

// social register
let socialregister = async (data) => {
    return new Promise((resolve, reject) => {
        let authdata = data;
        let account = new collection(authdata);
        account.password = account.generateHash(authdata.password);
        account.save(authdata, async (err, result) => {
            if (err) return reject({ message: "Error while register user " + err});
            let insertRow = {
                authId: result._id,
                name: result.name,
                dob: result.dob,
                age: result.age,
                gender: result.gender,
                email: result.email,
                countrycode : result.countrycode,
                mobilenumber: result.mobilenumber,
                weight : result.weight ? result.weight : 0,
                weightType : result.weightType,
                bodyfat: result.bodyfat ? result.bodyfat : 0,
                lbm : result.lbm ? result.lbm : 0,
                bmr : result.bmr ? result.bmr : 0,
                login_type : result.login_type,
                social_key : result.social_key,
                bodytype: result.body.bodytype ? result.body.bodytype : "",
                carbs: result.body.carbs ? result.body.carbs : 0,
                protein: result.body.protein ? result.body.protein : 0,
                fat: result.body.fat ? result.body.fat : 0,
                workouttype: result.workout.workouttype ? result.workout.workouttype : "",
                workpercentage: result.workout.workpercentage ? result.workout.workpercentage : 0.0,
                diettype : result.diettype ? result.diettype : 0,
                goal: result.goal ? result.goal : 0,
                leveltype: result.level.leveltype ? result.level.leveltype : "",
                levelpercentage: result.level.levelpercentage ? result.level.levelpercentage : 0,
                isActive : result.isActive,
                device_token : result.device_token,
                device_type : result.device_type,
                isNotification : result.isNotification,
                isPremium : result.isPremium
            };
            insertRow.authToken = jwt.sign(insertRow, process.env.decryptSecret , {
                expiresIn: 1440 * 60 * 30 // expires in 24 hours
            });
            
            return resolve(insertRow);
        })
    })
};

//user login
let get = async (data) => {
    return new Promise((resolve, reject) => {
          searchfilter = {}
            if(data.email){
                searchfilter.email = data.email
            }

        collection.findOne(searchfilter, async (err, list) => {
            console.log(list)
            if (err) {
                return reject({ message: "Error while login user " + err });
            } else {

                if(list){
                   
                    let password = data.password;

                    //console.log("isvalid",list.validPassword(password))

                if (list.validPassword(password)) {
                    if(!list.isActive) return reject({ message: "Your account is blocked,please conatct to admin" });               
                    let loginuser = {
                        authId: list._id,
                        name: list.name,
                        dob: list.dob,
                        age: list.age,
                        gender: list.gender,
                        email: list.email,
                        countrycode : list.countrycode,
                        mobilenumber: list.mobilenumber,
                        weight : list.weight ? list.weight : 0,
                        weightType : list.weightType,
                        bodyfat: list.bodyfat ? list.bodyfat : 0,
                        lbm : list.lbm ? list.lbm : 0,
                        bmr: list.bmr ? list.bmr : 0,
                        login_type : list.login_type,
                        social_key : list.social_key,
                        bodytype: list.body.bodytype ? list.body.bodytype : "",
                        carbs: list.body.carbs ? list.body.carbs : 0,
                        protein: list.body.protein ? list.body.protein : 0,
                        fat: list.body.fat ? list.body.fat : 0,
                        workouttype: list.workout.workouttype ? list.workout.workouttype : "",
                        workpercentage: list.workout.workpercentage ? list.workout.workpercentage : 0.0,
                        diettype : list.diettype ? list.diettype : 0,
                        goal: list.goal ? list.goal : 0,
                        leveltype: list.level.leveltype ? list.level.leveltype : "",
                        levelpercentage: list.level.levelpercentage ? list.level.levelpercentage : 0,
                        isActive : list.isActive,
                        isNotification : list.isNotification,
                        plantdetails : list.plantdetails ? list.plantdetails : "",
                        isPremium : list.isPremium
                    };
                    loginuser.authToken = jwt.sign(loginuser, process.env.decryptSecret, {
                        expiresIn: 1440 * 60 * 30 // expires in 24 hours
                    });

                    if(list.device_token != data.device_token){

                        //logic
                        var oldtoken = list.device_token;
                        var device_token = oldtoken;
                        var message = "User Logout";
                        var title = "Meal Plan";
                        var type = "2"

                        UserService.logoutPushNotification(
                            device_token,
                            message,
                            title,
                            type
                        );
                    }

                    let updateuser = await query.findOneAndUpdate(collection,
                        { _id: list._id },
                        { device_token : data.device_token , device_type : data.device_type }
                      );

                    loginuser.device_token = updateuser.device_token;
                    loginuser.device_type = updateuser.device_type;

                    return resolve(loginuser);
                } else {
                    return reject({ message: "Incorrect password, please try again." });
                }
                }
                else{
                    return reject({ message: "Please enter a valid email." });
                }
            }
        });
    })
}

// admin login
let getadmin = async (data) => {
    return new Promise((resolve, reject) => {
          searchfilter = {isAdmin : true}
            if(data.email){
                searchfilter.email = data.email
            }

        collection.findOne(searchfilter, async (err, list) => {
            if (err) {
                return reject({ message: "Error while login user " + err });
            } else {

                if(list){
                    let password = data.password;

                    //console.log("isvalid",list.validPassword(password))

                if (list.validPassword(password)) {
                    if(!list.isActive) return reject({ message: "Your account is blocked,please conatct to admin" });
                    let loginuser = {
                        authId: list._id,
                        email: list.email,
                        name: list.name,
                        mobilenumber: list.mobilenumber,
                        isActive : list.isActive
                    };
                    loginuser.authToken = jwt.sign(loginuser, process.env.decryptSecret, {
                        expiresIn: 1440 * 60 * 30 // expires in 24 hours
                    });

                    let updateuser = await query.findOneAndUpdate(collection,
                        { _id: list._id },
                        { device_token : data.device_token }
                      );

                    return resolve(loginuser);
                } else {
                    return reject({ message: "Incorrect password, please try again." });
                }
                }
                else{
                    return reject({ message: "Please enter a valid email." });
                }
            }
        });
    })
}

module.exports = {
    insert,
    socialregister,
    get,
    getadmin
}
