const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

 username:{
  type:String,
  required:true
 },

 fullName:{
  type:String,
  required:true
 },

 email:{
  type:String,
  required:true,
  unique:true,
  lowercase:true,
  trim:true
 },

 password:{
  type:String,
  required:true
 },

 college:String,

 branch:String,

 year:String,

 profilePic:String,

 role:{
  type:String,
  default:"student"
 },
 savedPosts:[
  {
   type:mongoose.Schema.Types.ObjectId,
   ref:"Post"
  }
 ],
 profilePhoto: {
  type: String,
  default: ""
}

},{timestamps:true});

UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User",UserSchema);