const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");


/* ===============================
   SEND MESSAGE
================================ */
router.post("/send", async (req, res) => {

  try {

    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const message = new Message({

      sender: decoded.id,
      receiver: req.body.receiverId,
      text: req.body.text

    });

    await message.save();

    res.json("Message sent");

  } catch (err) {

    res.status(500).json("Error sending message");

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

    res.json(messages);

  } catch (err) {

    res.status(500).json("Error fetching messages");

  }

});


module.exports = router;