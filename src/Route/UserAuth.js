const express = require('express');
const userAuthRouter = express.Router();
const {register,login} = require("../controller/userAuthenticate")

userAuthRouter.post("/register",register);
userAuthRouter.post("/login",login);


module.exports = userAuthRouter

