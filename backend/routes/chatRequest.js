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



/* GET REQUESTS */

router.get("/",auth,async(req,res)=>{

 const requests = await ChatRequest.find({

  receiver:req.user.id,

  status:"pending"

 }).populate("sender");



 res.json(requests);

});



module.exports = router;