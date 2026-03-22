require("dotenv").config();

const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());


mongoose.connect(

 process.env.MONGO_URI,

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


app.listen(5000,()=>{

 console.log("Server running on port 5000");

});