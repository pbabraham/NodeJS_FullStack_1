require('dotenv').config()
const user=require("../model/User")
const userSubRelation=require("../model/UserSubRelation")
const subscription=require("../model/Subscribtion")
const {passwordHash,passwordMatch}=require("../util/passwordSecure/passwordSecureFunction")
const jwt=require("jsonwebtoken")
const Subscription = require("../model/Subscribtion")
const moment=require("moment")
const { body, validationResult } = require('express-validator');


// you have to login first and get the token
const deleteAccount=async(req,res)=>{
    try{
        const {user_id}=req
        let updateQuery=await user.updateOne({_id:user_id._id},{$set:{isDeleted:true}})
        return res.json({status:true,message:"Deleted Successfully"})
    }catch(err){
        return res.status(500).json({status:500,errormessage:err.message})
    }
    
}

// if user want to take a plan , you only need to give 'planId'
const takeAPlane=async(req,res)=>{
    try{
        const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            
        // getting user_id from token validation
        const {user_id}=req
        const {planId}=req.body
        const subscriptionDetails=await subscription.findOne({_id:planId})
        
        // checking user plan over or not
        const userDetails=await user.findOne({_id:user_id._id})
        // if(userDetails.expiryDate){
        //     const userPlanExpiryDate=new Date(userDetails.expiryDate)
        //     const todaysDate=new Date(moment().format())

        //     if(!(userPlanExpiryDate < todaysDate)){
        //         return res.json({status:false,errormessage:"Your plan is not expired yet"})
        // }
        // }
        
        // update the user
        await user.findOneAndUpdate({_id:user_id._id},{planId,expiryDate:moment().add(subscriptionDetails.duration, 'months').calendar()})
        // inserting the data
        const data=await userSubRelation({userId:user_id._id,subscriptionId:planId,sessionExpire:moment().add(subscriptionDetails.duration, 'months').calendar()})
        await data.save()
        return res.json({status:true,message:"Now you can see all Paid movies"})
    }catch(err){
        return res.status(500).json({status:false,errormessage:err.message})
    }
}



module.exports={deleteAccount,takeAPlane}