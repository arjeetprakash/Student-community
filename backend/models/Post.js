const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({

 userId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },

 text:{
  type:String,
  required:true
 },

 createdAt:{
  type:Date,
  default:Date.now
 }

});

const PostSchema = new mongoose.Schema({

 userId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },

 title:{
  type:String
 },

 content:{
  type:String
 },

 tags:[
  {
   type:String,
   lowercase:true,
   trim:true
  }
 ],

 author:{
  type:String
 },

 role:{
  type:String
 },

 file:{
  type:String
 },

 likes:[
  {
   type:mongoose.Schema.Types.ObjectId,
   ref:"User"
  }
 ],

 comments:[CommentSchema],

 isPinned:{
  type:Boolean,
  default:false
 },

 pinnedUntil:{
  type:Date
 },

 isDeleted:{
  type:Boolean,
  default:false
 }

},
{timestamps:true}
);

PostSchema.index({ isDeleted: 1, isPinned: -1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ author: 1 });

module.exports = mongoose.model("Post",PostSchema);