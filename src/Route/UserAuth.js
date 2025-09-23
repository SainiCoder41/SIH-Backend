const express = require('express');
const userAuthRouter = express.Router();
const {register,} = require("../controller/userAuthenticate")

userAuthRouter.post("/register",register);


module.exports = userAuthRouter

