const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String,
        required: true, 
        unique: true 
    }, 
    password:{
        type:String,required:true
    },
    roleId:{type:Number,default:2},
    isDeleted:{
        type:Boolean,default:false
    },
    planId:{
        type:mongoose.Schema.Types.ObjectId,ref:"Subscription"
    },
    phoneNo:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    expiryDate:{
        type:Date
    },
    status:{
        type:String,
        default:"active"
    },
    payment:{
        type:Boolean,
        default:false
    },
}, { timestamps: true })


const User = mongoose.model('User', userSchema);

module.exports = User