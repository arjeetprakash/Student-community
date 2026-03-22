const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");


/* ===============================
   ADMIN AUTH MIDDLEWARE
================================ */
const verifyAdmin = (req) => {

  const token = req.headers.authorization.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.role !== "admin") {

    throw new Error("Access denied");

  }

};


/* ===============================
   GET ALL USERS
================================ */
router.get("/users", async (req, res) => {

  try {

    verifyAdmin(req);

    const users = await User.find().select("-password");

    res.json(users);

  } catch (err) {

    res.status(403).json("Not authorized");

  }

});


/* ===============================
   FILTER USERS BY YEAR & BRANCH
================================ */
router.get("/filter", async (req, res) => {

  try {

    verifyAdmin(req);

    const { year, branch } = req.query;

    let filter = {};

    if (year) filter.year = year;

    if (branch) filter.branch = branch;

    const users = await User.find(filter).select("-password");

    res.json(users);

  } catch (err) {

    res.status(403).json("Not authorized");

  }

});


module.exports = router;