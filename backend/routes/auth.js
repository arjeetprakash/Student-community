const router = require("express").Router();

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const multer = require("multer");

const User = require("../models/User");

const auth = require("../middleware/auth");



/* FILE STORAGE FOR PROFILE PHOTO */

const storage = multer.diskStorage({

 destination:(req,file,cb)=>{

  cb(null,"uploads/");

 },

 filename:(req,file,cb)=>{

  cb(null,Date.now()+"-"+file.originalname);

 }

});



const upload = multer({storage});



/* REGISTER USER */

router.post("/register", async (req,res)=>{

 try{

  const {

   username,

   fullName,

   email,

   password,

   college,

   branch,

   year

  } = req.body;



  // check existing email

  const existingUser = await User.findOne({email});



  if(existingUser){

   return res.status(400)

   .send("Email already registered");

  }



  // hash password

  const hashedPassword = await bcrypt.hash(

   password,

   10

  );



  const newUser = new User({

   username,

   fullName,

   email,

   password:hashedPassword,

   college,

   branch,

   year,

   role:"student"

  });



  await newUser.save();



  res.status(201)

  .send("Registered Successfully");

 }

 catch(err){

  console.log(err);

  res.status(500)

  .send("Server Error");

 }

});



/* LOGIN */

router.post("/login", async (req,res)=>{

 try{

  const {

   email,

   password

  } = req.body;



  const user = await User.findOne({

   email

  });



  if(!user){

   return res.status(400)

   .send("User not found");

  }



  const validPassword = await bcrypt.compare(

   password,

   user.password

  );



  if(!validPassword){

   return res.status(400)

   .send("Wrong password");

  }



  const token = jwt.sign(

   {

    id:user._id,

    email:user.email,

    username:user.username,

    role:user.role

   },

   process.env.JWT_SECRET,

   {

    expiresIn:"1d"

   }

  );



  res.json({

   token,

   role:user.role,

   username:user.username,

   email:user.email

  });

 }

 catch(err){

  console.log(err);

  res.status(500)

  .send("Server error");

 }

});



/* GET LOGGED USER PROFILE */

router.get("/me", auth, async (req,res)=>{

 try{

  const user = await User.findById(

   req.user.id

  )

  .select("-password");



  res.json(user);

 }

 catch(err){

  res.status(500)

  .json(err);

 }

});



/* UPLOAD PROFILE PHOTO */

router.put(

 "/upload-photo",

 auth,

 upload.single("file"),

 async(req,res)=>{

  try{

   const user = await User.findByIdAndUpdate(

    req.user.id,

    {

     profilePic:req.file.filename

    },

    {new:true}

   );



   res.json(user);

  }

  catch(err){

   res.status(500)

   .json(err);

  }

 });



module.exports = router;