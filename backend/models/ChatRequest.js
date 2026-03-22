const mongoose = require("mongoose");

const ChatRequestSchema = new mongoose.Schema({

 sender:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },

 receiver:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },

 status:{
  type:String,
  default:"pending"
 }

},{timestamps:true});

module.exports = mongoose.model(

 "ChatRequest",

 ChatRequestSchema

);