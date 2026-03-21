const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const auth = require("../middleware/auth");

const multer = require("multer");



/* FILE UPLOAD SETUP */

const storage = multer.diskStorage({

 destination: function(req,file,cb){

  cb(null,"uploads/");

 },

 filename: function(req,file,cb){

  cb(null,Date.now()+"-"+file.originalname);

 }

});

const upload = multer({storage});



/* CREATE POST */

router.post("/", auth, upload.single("file"), async (req,res)=>{

 try{

  const post = new Post({

   userId: req.user.id,

   title: req.body.title,

   content: req.body.content,

   author: req.user.email,

   role: req.user.role,

   file: req.file ? req.file.filename : null

  });

  await post.save();

  res.json(post);

 }

 catch(err){

  console.log("Create post error",err);

  res.status(500).send("Server error");

 }

});



/* GET ALL POSTS */

router.get("/", auth, async (req,res)=>{

 try{

  const posts = await Post.find()

  .sort({

   isPinned:-1,

   createdAt:-1

  });

  res.json(posts);

 }

 catch(err){

  console.log("Fetch post error",err);

  res.status(500).send("Server error");

 }

});



/* SOFT DELETE POST */

router.delete("/:id", auth, async (req,res)=>{

 try{

  const post = await Post.findByIdAndUpdate(

   req.params.id,

   {

    isDeleted:true,

    deletedBy:"admin"

   },

   {new:true}

  );

  res.json(post);

 }

 catch(err){

  console.log("Delete error",err);

  res.status(500).send("Server error");

 }

});



/* PIN POST WITH TIME */

router.put("/pin/:id", auth, async (req,res)=>{

 try{

  const hours = req.body.hours;

  let expireTime = null;



  if(hours){

   expireTime = new Date(

    Date.now() + hours*60*60*1000

   );

  }



  const post = await Post.findByIdAndUpdate(

   req.params.id,

   {

    isPinned:true,

    pinnedUntil:expireTime

   },

   {new:true}

  );



  res.json(post);

 }

 catch(err){

  console.log("Pin error",err);

  res.status(500).send("Server error");

 }

});



/* UNPIN POST */

router.put("/unpin/:id", auth, async (req,res)=>{

 try{

  const post = await Post.findByIdAndUpdate(

   req.params.id,

   {

    isPinned:false,

    pinnedUntil:null

   },

   {new:true}

  );



  res.json(post);

 }

 catch(err){

  console.log("Unpin error",err);

  res.status(500).send("Server error");

 }

});



module.exports = router;
router.get("/myposts", auth, async (req,res)=>{

 try{

  const posts = await Post.find({

   userId:req.user.id

  })

  .sort({

   createdAt:-1

  });



  res.json(posts);

 }

 catch(err){

  res.status(500).json(err);

 }

});
/* EDIT POST */

router.put("/:id", auth, async(req,res)=>{

 try{

  const post = await Post.findOneAndUpdate(

   {

    _id:req.params.id,

    userId:req.user.id

   },

   {

    title:req.body.title,

    content:req.body.content

   },

   {new:true}

  );



  res.json(post);

 }

 catch(err){

  res.status(500).json(err);

 }

});



/* USER DELETE OWN POST */

router.delete("/user/:id", auth, async(req,res)=>{

 try{

  await Post.deleteOne({

   _id:req.params.id,

   userId:req.user.id

  });



  res.json("deleted");

 }

 catch(err){

  res.status(500).json(err);

 }

});