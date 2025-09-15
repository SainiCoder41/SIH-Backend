const mongoose = require('mongoose');
const {Schema} = mongoose;
const userSchema = new Schema({
    fullName:{
        type:String,
        required :true,
        minLength:3,
        maxLength:40
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true,

    },
    role:{
        type:String,
        enum:["user","admin"],
        default:'user'
    },
    premium:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:true

    }
    
},{timestamps:true})


const User = mongoose.model("user",userSchema);
module.exports = User;