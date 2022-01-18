const mongoose=require("mongoose")

const userSubRelation=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    subscriptionId:{type:mongoose.Schema.Types.ObjectId,ref:"Subscription"},
    sessionExpire:{
        type:Date,
    },
    invoiceId:{
        type:String
    }
},{timestamps:true})

const UserSubRelation=mongoose.model("UserSubscriptionRelation",userSubRelation)

module.exports=UserSubRelation