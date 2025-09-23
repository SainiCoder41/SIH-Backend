const jwt = require("jsonwebtoken");
const User = require("../models/user");

const register = async (req, res) => {
  try {
    const { name, mobileNumber, state, district, village, language } = req.body;

    if (!name || !mobileNumber) {
      return res.status(400).json({ message: "Name and Mobile Number are required" });
    }

    // Check if user already exists (optional)
    // let existingUser = await User.findOne({ mobileNumber });
    // if (existingUser) {
    //   return res.status(400).json({ message: "User already registered with this mobile number" });
    // }

    // ✅ Correct: don't redeclare User
    const user = await User.create({
      name,
      mobileNumber,
      state,
      district,
      village,
      language,
      role: "user",
      premium: false,
    });

    // Generate JWT token (⚠️ no expiry as you wanted)
    const token = jwt.sign(
      { _id: user._id, mobileNumber: user.mobileNumber, role: user.role },
      process.env.JWT_KEY
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // use true in production with https
      sameSite: "None",
    });

    // Send response
    const reply = {
      name: user.name,
      mobileNumber: user.mobileNumber,
      state: user.state,
      district: user.district,
      village: user.village,
      language: user.language,
      role: user.role,
      premium: user.premium,
      _id: user._id,
    };

    return res.status(201).json({
      user: reply,
      token,
      message: "User Registered Successfully",
    });
  } catch (err) {
    return res.status(400).json({ message: "Error: " + err.message });
  }
};

module.exports = { register };
