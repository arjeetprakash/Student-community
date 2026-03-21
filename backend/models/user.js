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
  unique:true
 },

 password:{
  type:String,
  required:true
 },

 college:{
  type:String
 },

 branch:{
  type:String
 },

 year:{
  type:String
 },

 role:{
  type:String,
  default:"student"
 }

},{timestamps:true});

module.exports = mongoose.model("User",UserSchema);