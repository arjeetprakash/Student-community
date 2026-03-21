const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


/* REGISTER USER */
router.post("/register", async (req, res) => {

  try {

    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {

      return res.status(400).send("All fields required");

    }

    // check duplicate email
    const existingUser = await User.findOne({ email });

    if (existingUser) {

      return res.status(400).send("Email already registered");

    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // default role = student
    const newUser = new User({

      username,
      email,
      password: hashedPassword,
      role: role || "student"

    });

    await newUser.save();

    res.status(201).send("Registered Successfully");

  }

  catch (err) {

    console.log("Register error:", err);

    res.status(500).send("Server Error");

  }

});



/* LOGIN USER */
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });

    if (!user) {

      return res.status(400).send("User not found");

    }

    // check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {

      return res.status(400).send("Wrong password");

    }

    // create token with user info
    const token = jwt.sign(

      {

        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role

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

  }

  catch (err) {

    console.log("Login error:", err);

    res.status(500).send("Server error");

  }

});


module.exports = router;
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