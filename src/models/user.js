const mongoose = require('mongoose');
const {Schema} = mongoose;
const userSchema = new Schema({
    fullName:{
        type:String,
        required :true,
        minLength:3,
        maxLength:40
    },
    
    role:{
        type:String,
        enum:["user","admin","business"],
        default:'user'
    },
    premium:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:true

    },
    
},{timestamps:true})


const User = mongoose.model("user",userSchema);
module.exports = User;