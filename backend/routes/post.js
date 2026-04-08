const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/user");
const auth = require("../middleware/auth");

const extractTags = (title = "", content = "") => {
 const source = `${title} ${content}`;
 const matches = source.match(/#[a-zA-Z0-9_]+/g) || [];
 return [...new Set(matches.map((tag) => tag.toLowerCase().slice(1)).filter(Boolean))].slice(0, 8);
};


/* CREATE POST */
router.post("/", auth, async (req,res)=>{

 try{

    const title = (req.body.title || "").trim();
    const content = (req.body.content || "").trim();

    if (!title && !content) {
     return res.status(400).json({ message: "Title or content is required" });
    }

  const newPost = new Post({

     title,
     content,
   author:req.body.author,
   role:req.body.role,
     userId:req.user.id,
     tags: extractTags(title, content)

  });

  const savedPost = await newPost.save();

  res.json(savedPost);

 }
 catch(err){

  res.status(500).json(err);

 }

});



/* GET POSTS */
router.get("/", async (req,res)=>{

 try{

   const useAdvancedQuery = Boolean(
    req.query.page ||
    req.query.limit ||
    req.query.q ||
    req.query.sortBy ||
    req.query.onlyMine ||
    req.query.author ||
    req.query.savedIds
   );

   if (!useAdvancedQuery) {
    const posts = await Post.find({
      isDeleted: false
    }).sort({
      isPinned: -1,
      createdAt: -1
    });

    return res.json(posts);
   }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 50);
    const skip = (page - 1) * limit;
    const q = (req.query.q || "").trim();
    const onlyMine = req.query.onlyMine === "true";
    const author = (req.query.author || "").trim();
    const savedIdsRaw = (req.query.savedIds || "").trim();
    const sortBy = req.query.sortBy || "latest";

    const filter = {
     isDeleted:false
    };

    if (q) {
     filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { tags: { $elemMatch: { $regex: q.replace(/^#/, ""), $options: "i" } } }
     ];
    }

    if (onlyMine && author) {
     filter.author = author;
    }

    if (savedIdsRaw) {
     const savedIds = savedIdsRaw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
     if (savedIds.length) {
        filter._id = { $in: savedIds };
     }
    }

    const sort =
     sortBy === "top"
        ? { isPinned: -1, likesCount: -1, createdAt: -1 }
        : sortBy === "discussed"
         ? { isPinned: -1, commentsCount: -1, createdAt: -1 }
         : { isPinned: -1, createdAt: -1 };

    const pipeline = [
     {
        $match: filter
     },
     {
        $addFields: {
         likesCount: { $size: { $ifNull: ["$likes", []] } },
         commentsCount: { $size: { $ifNull: ["$comments", []] } }
        }
     },
     {
        $sort: sort
     },
     {
        $facet: {
         data: [
            { $skip: skip },
            { $limit: limit }
         ],
         total: [{ $count: "count" }]
        }
     }
    ];

    const result = await Post.aggregate(pipeline);
    const posts = result?.[0]?.data || [];
    const total = result?.[0]?.total?.[0]?.count || 0;

    res.json({
     data: posts,
     meta: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1)
     }
    });

 }
 catch(err){

  res.status(500).json(err);

 }

});



/* LIKE POST */
router.put("/like/:id", auth, async (req,res)=>{

 try{

  const post = await Post.findById(req.params.id);

   const alreadyLiked = post.likes.includes(req.user.id);

   if(!alreadyLiked){

   post.likes.push(req.user.id);

  }
  else{

   post.likes.pull(req.user.id);

  }

    await post.save();

   if (!alreadyLiked && post.userId?.toString() !== req.user.id) {
    const io = req.app.get("io");
    io.to(post.userId.toString()).emit("notification:new", {
     type: "like",
     title: "New like on your post",
     message: `${req.user.username || "Someone"} liked your post${post.title ? `: ${post.title}` : ""}`,
     createdAt: new Date().toISOString(),
     postId: post._id
    });
   }

   res.json({
     post,
     likesCount: post.likes.length,
     likedByCurrentUser: post.likes.includes(req.user.id)
    });

 }
 catch(err){

  res.status(500).json(err);

 }

});



/* COMMENT */
router.post("/comment/:id", auth, async (req,res)=>{

 try{

  const post = await Post.findById(req.params.id);

    const text = (req.body.text || "").trim();

    if (!text) {
     return res.status(400).json({ message: "Comment text is required" });
    }

    post.comments.push({

   userId:req.user.id,
     text

  });

  await post.save();

   if (post.userId?.toString() !== req.user.id) {
    const io = req.app.get("io");
    io.to(post.userId.toString()).emit("notification:new", {
      type: "comment",
      title: "New comment on your post",
      message: `${req.user.username || "Someone"} commented${post.title ? ` on ${post.title}` : " on your post"}`,
      createdAt: new Date().toISOString(),
      postId: post._id
    });
   }

  res.json(post);

 }
 catch(err){

  res.status(500).json(err);

 }

});


/* SAVE OR UNSAVE POST */
router.put("/save/:id", auth, async (req, res) => {
 try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
     return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
     return res.status(404).json({ message: "User not found" });
    }

    const alreadySaved = user.savedPosts.some((id) => id.toString() === req.params.id);

    if (alreadySaved) {
     user.savedPosts.pull(req.params.id);
    } else {
     user.savedPosts.push(req.params.id);
    }

    await user.save();

    res.json({
     saved: !alreadySaved,
     savedPosts: user.savedPosts
    });
 } catch (err) {
    res.status(500).json(err);
 }
});


/* GET SAVED POSTS IDS */
router.get("/saved", auth, async (req, res) => {
 try {
    const user = await User.findById(req.user.id).select("savedPosts");
    res.json({
     savedPosts: user?.savedPosts || []
    });
 } catch (err) {
    res.status(500).json(err);
 }
});


/* TRENDING TAGS */
router.get("/trending-tags", async (req, res) => {
 try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);

    const tags = await Post.aggregate([
     { $match: { isDeleted: false } },
     { $unwind: "$tags" },
     { $group: { _id: "$tags", count: { $sum: 1 } } },
     { $sort: { count: -1 } },
     { $limit: limit }
    ]);

    res.json(tags.map((tag) => ({
     tag: tag._id,
     count: tag.count
    })));
 } catch (err) {
    res.status(500).json(err);
 }
});


/* FEED SUMMARY */
router.get("/summary", auth, async (req, res) => {
 try {
    const [totalPosts, totalComments, totalLikes, myPosts, user] = await Promise.all([
     Post.countDocuments({ isDeleted: false }),
     Post.aggregate([
        { $match: { isDeleted: false } },
        { $project: { count: { $size: { $ifNull: ["$comments", []] } } } },
        { $group: { _id: null, total: { $sum: "$count" } } }
     ]),
     Post.aggregate([
        { $match: { isDeleted: false } },
        { $project: { count: { $size: { $ifNull: ["$likes", []] } } } },
        { $group: { _id: null, total: { $sum: "$count" } } }
     ]),
     Post.countDocuments({ isDeleted: false, userId: req.user.id }),
     User.findById(req.user.id).select("savedPosts")
    ]);

    res.json({
     totalPosts,
     totalComments: totalComments?.[0]?.total || 0,
     totalLikes: totalLikes?.[0]?.total || 0,
     myPosts,
     savedPosts: user?.savedPosts?.length || 0
    });
 } catch (err) {
    res.status(500).json(err);
 }
});


module.exports = router;