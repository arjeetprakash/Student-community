const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({

 userId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true
 },

 title:{
  type:String,
  required:true
 },

 content:{
  type:String,
  required:true
 },

 author:{
  type:String,
  required:true
 },

 role:{
  type:String,
  required:true
 },

 file:{
  type:String
 },

 isDeleted:{
  type:Boolean,
  default:false
 },

 deletedBy:{
  type:String
 },

 isPinned:{
  type:Boolean,
  default:false
 },

 pinnedUntil:{
  type:Date
 }

},{timestamps:true});

module.exports = mongoose.model("Post",PostSchema);