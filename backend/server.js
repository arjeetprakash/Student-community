require("dotenv").config();

const http = require("http");
const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const app=express();
const server = http.createServer(app);

const io = new Server(server, {
 cors: {
  origin: true,
  credentials: true
 }
});

app.set("io", io);

// Track online users and their last active time
const onlineUsers = new Map(); // userId -> { socketId, lastActive }

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use("/uploads", express.static("uploads"));

const globalLimiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 1000,
 standardHeaders: true,
 legacyHeaders: false
});

const authLimiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 100,
 standardHeaders: true,
 legacyHeaders: false
});

app.use("/api", globalLimiter);
app.use("/api/auth", authLimiter);

if (!MONGO_URI) {
 console.error("Missing required environment variable: MONGO_URI");
 process.exit(1);
}

if (!JWT_SECRET) {
 console.error("Missing required environment variable: JWT_SECRET");
 process.exit(1);
}

io.use((socket, next) => {
 try {
  const token = socket.handshake.auth?.token;

  if (!token) {
   return next(new Error("Unauthorized"));
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  socket.user = { id: decoded.id, role: decoded.role };
  return next();
 } catch (err) {
  return next(new Error("Unauthorized"));
 }
});

io.on("connection", (socket) => {
 socket.join(socket.user.id);

 // Track user as online
 onlineUsers.set(socket.user.id, {
  socketId: socket.id,
  lastActive: new Date()
 });

 // Broadcast user is online to all connected clients
 io.emit("user:online", { userId: socket.user.id });

 socket.on("conversation:opened", async ({ otherUserId }) => {
  try {
   const Message = require("./models/Message");

    const result = await Message.updateMany(
    {
     sender: otherUserId,
     receiver: socket.user.id,
     readByReceiver: false
    },
    {
     $set: {
      readByReceiver: true,
      readAt: new Date()
     }
    }
   );

     io.to(socket.user.id).emit("conversation:read", {
        otherUserId,
        clearedCount: result.modifiedCount || 0
     });
  } catch (err) {
   // ignore socket read failures
  }
 });

 socket.on("user:typing", ({ otherUserId }) => {
  io.to(otherUserId).emit("user:typing", { userId: socket.user.id });
 });

 socket.on("user:stopped-typing", ({ otherUserId }) => {
  io.to(otherUserId).emit("user:stopped-typing", { userId: socket.user.id });
 });

 socket.on("disconnect", () => {
  onlineUsers.delete(socket.user.id);
  io.emit("user:offline", { userId: socket.user.id });
 });
});


mongoose.connect(

 MONGO_URI,

 {

  serverSelectionTimeoutMS:30000

 }

)

.then(()=>console.log("DB Connected"))

.catch(err=>console.log(err));


app.use("/api/auth",require("./routes/auth"));
app.use("/api/post",require("./routes/post"));
app.use("/api/admin",require("./routes/admin"));
app.use("/api/message",require("./routes/message"));
app.use("/api/notice",require("./routes/notice"));
app.use("/api/chat-request",require("./routes/chatRequest"));

// Endpoint to get list of online users
app.get("/api/users/online", (req, res) => {
 const onlineUserIds = Array.from(onlineUsers.keys());
 res.json({ onlineUsers: onlineUserIds });
});

app.get("/",(req,res)=>res.send("API running"));


app.get("/health", (req, res) => {
 const dbConnected = mongoose.connection.readyState === 1;
 res.status(dbConnected ? 200 : 503).json({
  status: dbConnected ? "ok" : "degraded",
  dbConnected
 });
});


mongoose.connection.once("open", () => {
 server.listen(PORT,()=>{

  console.log(`Server running on port ${PORT}`);

 });
});