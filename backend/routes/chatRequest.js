const router = require("express").Router();

const ChatRequest = require("../models/ChatRequest");

const auth = require("../middleware/auth");



/* SEND REQUEST */

router.post("/send",auth,async(req,res)=>{

 const request = new ChatRequest({

  sender:req.user.id,

  receiver:req.body.userId

 });



 await request.save();



 res.json(request);

});



/* ACCEPT REQUEST */

router.put("/accept/:id",auth,async(req,res)=>{

 const request = await ChatRequest.findByIdAndUpdate(

  req.params.id,

  {status:"accepted"},

  {new:true}

 );



 res.json(request);

});



/* REJECT REQUEST */

router.delete("/reject/:id",auth,async(req,res)=>{

 try{

  const request = await ChatRequest.findByIdAndDelete(req.params.id);

  res.json("Request rejected");

 }catch(err){

  res.status(500).json("Error rejecting request");

 }

});



/* GET PENDING REQUESTS (RECEIVER) */

router.get("/pending",auth,async(req,res)=>{

 try{

  const requests = await ChatRequest.find({

   receiver:req.user.id,

   status:"pending"

  }).populate("sender","fullName email branch year");



  res.json(requests);

 }catch(err){

  res.status(500).json("Error fetching requests");

 }

});



/* GET SENT REQUESTS (SENDER) */

router.get("/sent",auth,async(req,res)=>{

 try{

  const requests = await ChatRequest.find({

   sender:req.user.id,

   status:"pending"

  }).populate("receiver","fullName email branch year");



  res.json(requests);

 }catch(err){

  res.status(500).json("Error fetching sent requests");

 }

});



/* GET ACCEPTED CONVERSATIONS */

router.get("/conversations",auth,async(req,res)=>{

 try{

  const conversations = await ChatRequest.find({

   $or:[

    {sender:req.user.id,status:"accepted"},

    {receiver:req.user.id,status:"accepted"}

   ]

  }).populate("sender","fullName email branch year").populate("receiver","fullName email branch year");



  res.json(conversations);

 }catch(err){

  res.status(500).json("Error fetching conversations");

 }

});



/* GET REQUESTS */

router.get("/",auth,async(req,res)=>{

 try{

  const requests = await ChatRequest.find({

   receiver:req.user.id,

   status:"pending"

  }).populate("sender");



  res.json(requests);

 }catch(err){

  res.status(500).json("Error fetching requests");

 }

});



module.exports = router;