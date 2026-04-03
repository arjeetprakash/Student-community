const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const auth = require("../middleware/auth");

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

/* ===============================
   REGISTER USER
================================ */
router.post("/register", async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json("Database not connected");
    }

    const {
      username,
      fullName,
      email,
      password,
      college,
      branch,
      year,
      role
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
      college,
      branch,
      year,
      role: role || "student",
      profilePhoto: ""
    });

    await newUser.save();

    res.status(201).json("Registered successfully");
  } catch (err) {
    console.log("Register error:", err);
    res.status(500).json("Server error");
  }
});


/* ===============================
   LOGIN USER
================================ */
router.post("/login", async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json("Database not connected");
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json("User not found");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json("Wrong password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      username: user.username,
      email: user.email,
      userId: user._id
    });

  } catch (err) {

    console.log("Login error:", err);
    res.status(500).json("Server error");

  }
});


/* ===============================
   GET CURRENT USER PROFILE
================================ */
router.get("/me", async (req, res) => {

  try {

    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    res.json(user);

  } catch (err) {

    res.status(401).json("Invalid token");

  }

});


/* ===============================
   GET USERS FOR SEARCH
================================ */
router.get("/users", auth, async (req, res) => {

  try {

    const users = await User.find({
      _id: { $ne: req.user.id }
    }).select("-password");

    res.json(users);

  } catch (err) {

    res.status(500).json("Error fetching users");

  }

});


/* ===============================
   UPDATE PROFILE PHOTO
================================ */
router.put("/profile-photo", async (req, res) => {

  try {

    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      {
        profilePhoto: req.body.profilePhoto
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);

  } catch (err) {

    res.status(500).json("Error updating photo");

  }
});


/* ===============================
  UPDATE YEAR
================================ */
router.put("/update-year", auth, async (req,res)=>{

 try{

  const user = await User.findByIdAndUpdate(

  req.user.id,

  {year:req.body.year},

  {new:true}

  ).select("-password");

  res.json(user);

 }
 catch(err){

  res.status(500).json(err);

 }

});


/* ===============================
  UPDATE PROFILE (general)
================================ */
router.put("/update-profile", auth, async (req,res)=>{

 try{

  const {fullName,college,branch,year,profilePhoto} = req.body;

  const updates = {};
  if(fullName!==undefined) updates.fullName=fullName;
  if(college!==undefined) updates.college=college;
  if(branch!==undefined) updates.branch=branch;
  if(year!==undefined) updates.year=year;
  if(profilePhoto!==undefined) updates.profilePhoto=profilePhoto;

  const user = await User.findByIdAndUpdate(
  req.user.id,
  updates,
  {new:true}
  ).select("-password");

  res.json(user);

 }
 catch(err){

  console.log(err);
  res.status(500).json("Error updating profile");

 }

});


module.exports = router;
