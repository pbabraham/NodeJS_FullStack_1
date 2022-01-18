const Subscription = require("../model/Subscribtion")
const userDB=require("../model/User")
const moviesDB=require("../model/Movies")
const seriesDB=require("../model/Series")
const performerDB=require("../model/Performer")
const {passwordHash,passwordMatch}=require("../util/passwordSecure/passwordSecureFunction")
const { body, validationResult } = require('express-validator');
const categoryDB=require("../model/Category")
var generator = require('generate-password');
const mailService=require("../util/mail-service")

let password = generator.generate({
	length: 10,
	numbers: true,
});



// admin can see all the registered user
const showAllUsers=async(req,res)=>{
    try{
        const allUsers=await userDB.find({})
        return res.json({status:true,data:allUsers})

    }catch(err){
        return res.status(500).json({status:false,errormessage:err.message})
    }
    
}

// Show a particular user only you have to give user 'id' in the url 
// desciption:fetch user info
/** * * Handle login post request *
//  *  @request {id} req  *
//  *  @responce {json} res  *
//  *  @Param {*} next  *  */
const particularUser=async(req,res)=>{
    try{
        const {id}=req.params
        const userData=await userDB.findOne({_id:id}).populate("planId")
        delete userData._doc.password
        return res.json({status:true,data:userData})
    }catch(err){ 
        return res.status(500).json({status:false,errormessage:err.message})
    }
}

const updateUser=async(req,res)=>{
    try{
        const {id}=req.params
        // const {isAdmin,isDeleted}=req.body
        let updateUser=await userDB.updateOne({_id:id},{$set:req.body})
        return res.json({status:true,message:"User Updated"})
        
        

    }catch(err){ 
        return res.status(500).json({status:false,errormessage:err.message})
    }
}


const createUser=async(req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
    }
        // Checking password and confirm password are same or not
        if((req.body.password) && ((req.body.password) === (req.body.confirmPassword))){

            let hash=await passwordHash(req.body.password,10)
            delete req.body.password
            const data=await userDB({...req.body,password:hash})
            await data.save()
            return res.json({status:true,data})

        }
        else{

            return res.status(401).json({status:false,errormessage:"Password And Confirm Password Does Not Match"})
        }
    }catch(error){
        res.status(500).json({status:false,errormessage:error.message})
    }
}







const deleteUser=async(req,res)=>{
    try{
        // get the id from url
        const {userId}=req.params
        const data=await userDB.findOneAndDelete({_id:userId})
        return res.json({status:true,message:"User Deleted"})
    }catch(error){
        return res.status(500).json({status:false,errormessage:error.message})
    }
}

const giveAdminPermission=async(req,res)=>{
    try{
        const {userId}=req.params
        const data=await userDB.findOneAndUpdate({_id:userId},{$set:{roleId:1}})
        return res.json({status:true,message:"User Updated"})
    }catch(error){
        return res.status(500).json({status:false,errormessage:error.message})
    }
}

const takeBackAdminPermission=async(req,res)=>{
    try{
        const {userId}=req.params
        const data=await userDB.findOneAndUpdate({_id:userId},{$set:{roleId:2}})
        return res.json({status:true,message:"User Updated"})
    }catch(error){
        return res.status(500).json({status:false,errormessage:error.message})
    }
}


const countAllMovies=async(req,res)=>{
    try{
        const totalMovies=await moviesDB.find({}).count()
        return res.json({status:true,totalMovies})
    }catch(error){
        return res.status(500).json({status:false,errormessage:error.message})
    }
}


const countAllSeries=async(req,res)=>{
    try{
        const totalSeries=await seriesDB.find({}).count()
        return res.json({status:true,totalSeries})
    }catch(error){
        return res.status(500).json({status:false,errormessage:error.message})
    }
}

const countAllUsers=async(req,res)=>{
    try{
        const totalUsers=await userDB.find({}).count()
        return res.json({status:true,totalUsers})
    }catch(error){
        return res.status(500).json({status:false,errormessage:error.message})
    }
}

// giving a password to a performer
const createAccountForPerformer=async(req,res)=>{
    try{
        const {performerId}=req.params
        const performer=await performerDB.findOne({_id:performerId})
        if(performer.canLogin){
            return res.json({status:false,errormessage:"Performer has already account"})
        }
        let hash=await passwordHash(password,10)
        // console.log("send it from email to performer",password)
        mailService(performer.email,"Your account credentials",`Your Username and Password is ${performer.stageName}, ${password}`)
        await performerDB.findOneAndUpdate({_id:performerId},{$set:{password:hash,canLogin:true}})
        return res.json({status:true,message:"Successfully created account for performer and username and password is sended in mail"})
    }catch(error){
        return res.status(500).json({status:false,errormessage:error.message})
    }
}

module.exports={showAllUsers,updateUser,createUser,particularUser,deleteUser,giveAdminPermission,
                takeBackAdminPermission,countAllMovies,
                countAllSeries,countAllUsers,createAccountForPerformer}
