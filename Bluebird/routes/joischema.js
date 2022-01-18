const Joi = require('@hapi/joi')
const schemas = {
  Registration: Joi.object().keys({
    name: Joi.string().required().messages({ 'string.empty' : "name is not allowed to be empty" , 'any.required' : "name is required"}),
    dob: Joi.string().required().messages({ 'string.empty' : "dob is not allowed to be empty" , 'any.required' : "dob is required"}),
    gender: Joi.string().required().messages({ 'string.empty' : "gender is not allowed to be empty" , 'any.required' : "gender is required"}),
    age : Joi.required().messages({ 'any.required' : "age is required"}),
    email:Joi.string().required().messages({ 'string.empty' : "email is not allowed to be empty" , 'any.required' : "email is required"}),
    password : Joi.any(),
    countrycode: Joi.any(),
    mobilenumber : Joi.any(),
    device_token : Joi.string().required().messages({ 'string.empty' : "device_token is not allowed to be empty" , 'any.required' : "device_token is required"}),
    login_type : Joi.any(),
    social_key : Joi.any(),
    device_type : Joi.string().required()
  }),
  Login: Joi.object().keys({
    email: Joi.any(),
    password:Joi.string(),
    device_token:Joi.string(),
    login_type:Joi.any(),
    social_key:Joi.any(),
    device_type : Joi.string().required()
  }),
  Forgotpassword: Joi.object().keys({
     email:Joi.string().required(),
  }),
  EditName: Joi.object().keys({
    name:Joi.string().required(),
 }),
  EditDob: Joi.object().keys({
    dob:Joi.string().required(),
  }),
EditGender: Joi.object().keys({
  gender:Joi.string().required(),
}),
EditWeight: Joi.object().keys({
  weight:Joi.required(),
  weightType:Joi.required()
}),
EditBodyfat: Joi.object().keys({
  bodyfat:Joi.required(),
}),
EditBodytype: Joi.object().keys({
  body:Joi.string().required(),
}),
EditMacro: Joi.object().keys({
  carbs:Joi.number().required(),
  protein:Joi.number().required(),
  fat:Joi.number().required(),
}),
EditAcitvity: Joi.object().keys({
  workouttype:Joi.string().required(),
  workpercentage:Joi.number().required()
}),
EditGoal: Joi.object().keys({
  goal_id:Joi.number().required(),
}),
EditDiet: Joi.object().keys({
  diettype:Joi.number().required(),
}),
  Changepassword: Joi.object().keys({
     currentpassword: Joi.string().required(),
     newpassword:Joi.string().required(),
     confirmpassword:Joi.string().required()
  }),
  Editprofile: Joi.object().keys({
    name: Joi.string(),
    dob: Joi.string(),
    gender: Joi.string(),
    weight: Joi.any(),
    bodyfat:  Joi.string()
  }),
  // define all the other schemas below
};
module.exports = schemas;

// customize responce name :  name: Joi.string().required().messages({ 'string.empty' : 'please enter name'}),
// customize responce name: Joi.string().required().error(new Error("name can not be empty.")),
// tutorial : https://dev.to/jacqueline/using-hapi-joi-version-16-1-7-to-validate-a-request-body-in-a-restful-api-bje
// userName:Joi.string().when('isAdmin',{is : false , then : Joi.required()}),