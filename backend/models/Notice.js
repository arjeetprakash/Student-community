const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(

{

 text:{
  type:String,
  required:true
 },

 file:{
  type:String
 },

 isPinned:{
  type:Boolean,
  default:false
 }

},

{timestamps:true}

);

module.exports = mongoose.model("Notice",NoticeSchema);