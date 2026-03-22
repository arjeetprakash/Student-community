const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ===============================
   REGISTER USER
================================ */
router.post("/register", async (req, res) => {
  try {
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
    console.log(err);
    res.status(500).json("Server error");
  }
});


/* ===============================
   LOGIN USER
================================ */
router.post("/login", async (req, res) => {
  try {

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
      email: user.email
    });

  } catch (err) {

    console.log(err);
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
  /* UPDATE YEAR */

router.put("/update-year",auth,async(req,res)=>{

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

});


module.exports = router;
