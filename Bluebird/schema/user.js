let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

let UserSchema = mongoose.Schema({
    name: { type: String },
    dob: { type: String },
    age: { type: Number },
    gender: { type: String },
    bodyfatarr: [{
      userbodyfat : { type : Number },
      date : { type: Date, default: Date.now },
    }],
    bodyfat: { type: Number },
    weightarr: [{
      userweight : { type : Number },
      date : {type: Date, default: Date.now},
    }],
    weight: { type : Number },
    weightType : { type : Number, default : 1 },
    bmr : { type: Number },
    bmrarr: [{
      userbmr : { type : Number },
      date : {type: Date, default: Date.now},
    }],
    lbm : { type : Number },
    lbmarr: [{
      userlbm : { type : Number },
      date : {type: Date, default: Date.now},
    }],
    tdee : { type : Number },
    total_tdee: { type : Number },
    mealplan1: { type : Number },
    mealplan2: { type : Number },
    diettype: { type : Number },
    mealstartdate : { type : Date },
    email: { type: String },
    password: { type: String },
    profileurl:{ type: String },
    countrycode : { type : String , default: "" },
    mobilenumber: { type: String , default: "" },
    login_type: { type: Number, default: 0 },//0 = Normal Login, 1 = Facebook Login, 2 = Google Login, 3 = apple id login
    social_key: { type: String, default: "" },
    user_type: { type: Number, default: 0 }, //0 = admin, 1 = user
    isActive: { type:Boolean, default: true },
    isNotification: {type:Boolean, default: true },
    device_type: { type: String, default: "" },
    device_id: { type: String, default: "" },
    device_token: { type: String, default: "" },
    isPremium: {type:Boolean, default: false },
    mealPdfUrl: { type : String },
    groceriePdfUrl: { type : String },
    plantdetails: {
      _id : {
        type : mongoose.Schema.Types.ObjectId
      },
      plantitle : {
        type : String
      },
      planPackageName : {
        type : String
      },
      planprice : {
        type : Number
      },
      planterm : {
        type : Number
      },
      plansubscription : {
        type : Number
      },
      plan_start_date : {
        type : Date
      },
      plan_end_date : {
        type : Date
      }
    },
    mealpercentage: { type : Array },
    userphoto: [{
      photourl: {
        type : String
      },
      photodate : {
        type: Date,
        default: Date.now
      },
      userweight : {
        type : Number
      },
      userbodyfat : {
        type : Number
      },
      userlbm : {
        type : Number
      }
    }],
    body: {
        bodytype: {
          type: String
        },
        carbs: {
          type: Number
        },
        protein: {
          type: Number
        },
        fat: {
          type: Number
        }
    },
    workout : {
      workouttype : {
        type : String
      },
      workpercentage : {
        type : Number
      }
    },
    goal : { type : Number },
    isAdmin : { type:Boolean, default: false },
    level : {
      leveltype : {
        type : String
      },
      levelpercentage : {
        type : Number
      }
    },
    // testmeal : [{ type : 'ObjectId'}],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function (password) {
  // console.log(this.password)
  // console.log(password)
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('user', UserSchema, 'user');
