const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async(req ,res)=>{
    try{
        const {fullName,emailId, password} = req.body;
        req.body.password = await bcrypt.hash(password,10);
        req.body.role = "user";
             const user =  await User.create(req.body);
                  const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY);

         const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
          role:user.role,
          premium:user.premium,
        _id: user._id,
    }
     res.status(201).json({
        user:reply,
        message:"User Register Successfully"
    })
    res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
});
    }catch(err){
        res.status(400).send("Error "+err);

    }
}
const login = async (req,res)=>{
    try{
        const {emailId,password}= req.body;
        if(!emailId)
            throw new Error("Invalid Credentails");
        if(!password)
            throw new Error("Invalid Credentails");

        const user = await User.findOne({emailId});
        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentails");

        const reply = {
          firstName:user.firstName,
          emailId:user.emailId,
            role:user.role,
            premium:user.premium,
            _id:user._id,
        
        }

     const token = jwt.sign({ _id: user._id, emailId:emailId,role:user.role }, process.env.JWT_KEY);
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None"
});


    res.status(201).json({
      user:reply,
      message:"Loggin Succesfully"
    });

    }catch(err){
        res.status(401).send("Error : "+err);
    }
}
module.exports = {register,login};