const express = require("express");

const router = express.Router();

const Notice = require("../models/Notice");

const auth = require("../middleware/auth");

const multer = require("multer");



/* FILE STORAGE */

const storage = multer.diskStorage({

 destination:(req,file,cb)=>{

  cb(null,"uploads/");

 },

 filename:(req,file,cb)=>{

  cb(null,Date.now()+"-"+file.originalname);

 }

});



const upload = multer({storage});



/* CREATE NOTICE */

router.post(

 "/",

 auth,

 upload.single("file"),

 async(req,res)=>{

  try{

   if(req.user.role!=="admin"){

    return res.status(403).send("only admin");

   }



   const notice = new Notice({

    text:req.body.text,

    file:req.file?.filename,

    isPinned:req.body.isPinned==="true"

   });



   await notice.save();

    const io = req.app.get("io");
    io.emit("notification:new", {
     type: "notice",
     title: "New notice published",
     message: notice.text?.slice(0, 120) || "A new notice is available",
     createdAt: new Date().toISOString(),
     noticeId: notice._id
    });



   res.json(notice);

  }

  catch(err){

   console.log(err);

   res.status(500).send("error");

  }

 });





/* GET NOTICES */

router.get("/",async(req,res)=>{

 try{

  const notices = await Notice.find()

  .sort({

   isPinned:-1,

   createdAt:-1

  });



  res.json(notices);

 }

 catch(err){

  res.status(500).send(err);

 }

});



module.exports = router;