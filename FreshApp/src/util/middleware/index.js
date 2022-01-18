const jwt=require("jsonwebtoken")
require('dotenv').config({path:"../../../.env"})
const user=require("../../model/User")
const moment=require("moment")

const verification=(req,res,next)=>{
    try{
        const decode=jwt.verify(req.headers.authorization,process.env.TOKEN_SECRET)
        if(!decode){
            return res.json("UNAUTHENTICATED")
        }
        
        req.user_id=decode

        next()
    }catch(error){
        return res.status(400).json(error.message)
    }
    
    
    
}


const isAdmin=async(req,res,next)=>{
    const user_id=req.user_id
        // find user by user_id
        // const findUser=await user.findOne({_id:user_id})
        // find if it is admin or not
        // if(!(findUser.isAdmin)){
        //     return res.json("UNAUTHERISED")
        // }
        if(user_id.roleId!==1){
            return res.json("UNAUTHERISED")
        }
        next()
}

const payOrNot=async(req,res,next)=>{
    try{
      if(req.headers.authorization==undefined){
          req.pay=false
          return next()
      }
      const decode=jwt.verify(req.headers.authorization,process.env.TOKEN_SECRET)
      if(!decode){
        return res.json("UNAUTHENTICATED")
      }
      else{
          const userData=await user.findOne({_id:decode})
          if(userData.expiryDate==undefined){
              req.pay=false
              return next()

            }
          const userPlanExpiryDate=new Date(userData.expiryDate)
          const todaysDate=new Date(moment().format())
          if(userPlanExpiryDate > todaysDate){
              req.pay=true
              return next()
          }
          else{
              req.pay=false
              return next()
          }
      }
      
    }catch(error){
        return res.status(400).json(error.message)
    }
}

module.exports={verification,isAdmin,payOrNot}