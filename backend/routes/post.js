const router = require("express").Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");


/* CREATE POST */
router.post("/", auth, async (req,res)=>{

 try{

  const newPost = new Post({

   title:req.body.title,
   content:req.body.content,
   author:req.body.author,
   role:req.body.role,
   userId:req.user.id

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

  const posts = await Post.find({
   isDeleted:false
  })
  .sort({createdAt:-1});

  res.json(posts);

 }
 catch(err){

  res.status(500).json(err);

 }

});



/* LIKE POST */
router.put("/like/:id", auth, async (req,res)=>{

 try{

  const post = await Post.findById(req.params.id);

  if(!post.likes.includes(req.user.id)){

   post.likes.push(req.user.id);

  }
  else{

   post.likes.pull(req.user.id);

  }

  await post.save();

  res.json(post);

 }
 catch(err){

  res.status(500).json(err);

 }

});



/* COMMENT */
router.post("/comment/:id", auth, async (req,res)=>{

 try{

  const post = await Post.findById(req.params.id);

  post.comments.push({

   userId:req.user.id,
   text:req.body.text

  });

  await post.save();

  res.json(post);

 }
 catch(err){

  res.status(500).json(err);

 }

});


module.exports = router;