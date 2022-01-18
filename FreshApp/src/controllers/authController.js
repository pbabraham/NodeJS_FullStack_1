require('dotenv').config()
const userDB=require("../model/User")
const {passwordHash,passwordMatch}=require("../util/passwordSecure/passwordSecureFunction")
const jwt=require("jsonwebtoken")
const { body, validationResult } = require('express-validator');
const mailService=require("../util/mail-service")
const performerDB=require("../model/Performer")


// user need to give 'name,email,password and confirmPassword' in a body
const register=async(req,res)=>{
    try{
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
        if(req.body.roleId){
            return res.json({status:false,errormessage:"Not have a permission"})
        }
        
        // checking email present in performer db or not
        const checkingEmail=await performerDB.findOne({email:req.body.email})
        if(checkingEmail){
            return res.status(400).json({status:false,errormessage:"Email Already Present in Performer"})
        }

        // Checking password and confirm password are same or not
        if((req.body.password) && ((req.body.password) === (req.body.confirmPassword) )){
            // validating 
            

            let hash=await passwordHash(req.body.password,10)
            delete req.body.password
            const data=await userDB({...req.body,password:hash})
            await data.save()
            mailService(req.body.email,"Registered","Successfully registered on stromnis")
            return res.json({status:true,data,message:"Registration successful"})

        }
        else{

            return res.status(401).json({status:false,errormessage:"Password And Confirm Password Does Not Match"})
        }
    }catch(error){
        // console.log({errorcode:error})
        if(error.code==11000){
            return res.status(500).json({status:false,errormessage:"Email already present"})
        }
        res.status(500).json({status:false,errormessage:error.message,errorcode:error})
    }
    
}

// user need to give 'email and password' in a body
const login=async(req,res)=>{
    try{
        const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
        const {email,password}=req.body
        // checking email present in db or not
        const data=await userDB.findOne({email})
        // checking a performer
        const performer=await performerDB.findOne({email})
        if(performer){
            if(performer && performer.canLogin){
                const pass=await passwordMatch(password,performer.password)
                if(!pass){
                    return res.status(401).json({status:false,errormessage:"Inncorrect password"})
                }
                delete performer._doc.password
                const token=jwt.sign({_id:performer._id,roleId:performer.roleId},process.env.TOKEN_SECRET)
                return res.json({status:true,data:performer,token,message:"Login Successfully"})
            }
            else{
                return res.status(400).json({status:false,errormessage:"Wrong credentials"})
            }
        }
        if(!data){
            return res.status(400).json({status:false,errormessage:"Email not found"})
        }
        // if user delete his/her account
        if(data.isDeleted){
            return res.status(400).json({status:false,errormessage:"You deleted your account, if you want back please contact admin"})
        }
        // checking password correct or not
        const pass=await passwordMatch(password,data.password)
        if(pass){
            delete data._doc.password
            const token=jwt.sign({_id:data._id,roleId:data.roleId},process.env.TOKEN_SECRET)
            return res.json({status:true,data,token,message:"Login Successfully"})
        }
        else{
            return res.status(401).json({status:false,errormessage:"Inncorrect password"})
    }
    }catch(error){
        return res.json({status:false,errormessage:error.message})
    }
    

}

const forgetPasswordLink=async(req,res)=>{
    const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
    const {email,sendURL}=req.body
    const user=await userDB.findOne({email})
    if(!user){
        return res.json({status:false,errormessage:"User not found"})
    }

    const generateToken=jwt.sign({userId:user._id},process.env.TOKEN_SECRET,{expiresIn:60 * 60})
    mailService(email,"Reset-Password",`${sendURL}/${generateToken}`)
    res.json("Please check your mail!")
}

const resetPassword=async(req,res)=>{
    try{
        const {token}=req.params
        const {password}=req.body
        let hash=await passwordHash(password,10)
        const decode=jwt.verify(token,process.env.TOKEN_SECRET)
        const {userId}=decode
        const user=await userDB.findOneAndUpdate({_id:userId},{$set:{password:hash}})
        return res.json({status:true,message:"Password Reset Successfully"})
    }catch(error){
        return res.json(error)
    }
    
}




module.exports={register,login,forgetPasswordLink,resetPassword}
