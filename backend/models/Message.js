const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  text: String,

  attachment: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number
  }

  ,readByReceiver: {
    type: Boolean,
    default: false
  },

  readAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);