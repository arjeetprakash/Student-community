const router = require("express").Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Message = require("../models/Message");
const ChatRequest = require("../models/ChatRequest");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});


/* ===============================
   SEND MESSAGE
================================ */
router.post("/send", upload.single("file"), async (req, res) => {

  try {

    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const messageText = String(req.body.text || "").trim();

    if (!messageText && !req.file) {
      return res.status(400).json("Message text or attachment is required");
    }

    const message = new Message({

      sender: decoded.id,
      receiver: req.body.receiverId,
      text: messageText,
      attachment: req.file
        ? {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
          }
        : undefined,
      readByReceiver: false,
      readAt: null

    });

    await message.save();

    const io = req.app.get("io");
    if (io) {
      io.to(String(decoded.id)).emit("message:new", message);
      io.to(String(req.body.receiverId)).emit("message:new", message);
    }

    res.status(201).json(message);

  } catch (err) {

    res.status(500).json("Error sending message");

  }

});


/* ===============================
   UNREAD COUNTS FOR CONVERSATIONS
================================ */
router.get("/unread-count", async (req, res) => {

  try {

    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const conversations = await ChatRequest.find({
      $or: [
        { sender: decoded.id, status: "accepted" },
        { receiver: decoded.id, status: "accepted" }
      ]
    });

    const totalUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId =
          String(conversation.sender) === String(decoded.id)
            ? conversation.receiver
            : conversation.sender;

        return Message.countDocuments({
          sender: otherUserId,
          receiver: decoded.id,
          readByReceiver: false
        });
      })
    );

    res.json({ totalUnread: totalUnread.reduce((sum, count) => sum + count, 0) });

  } catch (err) {

    res.status(500).json("Error fetching unread count");

  }

});


/* ===============================
   GET CHAT BETWEEN USERS
================================ */
router.get("/:userId", async (req, res) => {

  try {

    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const messages = await Message.find({

      $or: [

        { sender: decoded.id, receiver: req.params.userId },

        { sender: req.params.userId, receiver: decoded.id }

      ]

    }).sort({ createdAt: 1 });

    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: decoded.id,
        readByReceiver: false
      },
      {
        $set: {
          readByReceiver: true,
          readAt: new Date()
        }
      }
    );

    res.json(messages);

  } catch (err) {

    res.status(500).json("Error fetching messages");

  }

});
module.exports = router;