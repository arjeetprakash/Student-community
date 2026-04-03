require("dotenv").config();

const http = require("http");
const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const jwt = require("jsonwebtoken");
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

app.use(cors());
app.use(express.json());

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