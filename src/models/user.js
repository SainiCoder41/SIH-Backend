const mongoose = require('mongoose');
const {Schema} = mongoose;
// user.model.js
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const User = mongoose.model("user",userSchema);
module.exports = User

