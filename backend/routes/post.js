const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const auth = require("../middleware/auth");   // correct middleware import



/* CREATE POST */
router.post("/", auth, async (req, res) => {

  try {

    const post = new Post({

      userId: req.user.id,

      title: req.body.title,
      content: req.body.content,

      author: req.user.email,
      role: req.user.role

    });

    await post.save();

    res.json(post);

  }
  catch (err) {

    console.log("Create post error", err);
    res.status(500).send("Server error");

  }

});



/* GET ALL POSTS */
router.get("/", auth, async (req, res) => {

  try {

    const posts = await Post.find().sort({ createdAt: -1 });

    res.json(posts);

  }
  catch (err) {

    console.log("Fetch post error", err);
    res.status(500).send("Server error");

  }

});



/* DELETE POST (ADMIN ONLY) */
router.delete("/:id", auth, async (req, res) => {

  try {

    if (req.user.role !== "admin") {

      return res.status(403).send("Admin only");

    }

    await Post.findByIdAndDelete(req.params.id);

    res.send("Post deleted");

  }
  catch (err) {

    console.log("Delete post error", err);
    res.status(500).send("Server error");

  }

});


module.exports = router;