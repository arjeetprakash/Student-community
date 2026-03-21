const router = require("express").Router();
const Notice = require("../models/Notice");
const auth = require("../middleware/auth");

// Create notice
router.post("/", auth, async (req, res) => {
  try {
    const notice = await Notice.create({
      text: req.body.text,
      createdBy: req.user.id
    });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Get notices
router.get("/", async (_req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
