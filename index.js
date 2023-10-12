const mongoose = require ('mongoose');


const express= require ('express');
const app= express();
const session = require("express-session");
const config= require("./config/config");

app.use(session({
  secret:config.sessionKey,
  cookie:{maxAge:86400000},
  resave: false,
  saveUninitialized:true,
}))

const dotenv=require("dotenv");
dotenv.config();
const PORT= process.env.PORT ;
mongoose.connect(process.env.MONGODB_URI).then(()=>{
  console.log("Mongodb Connected...");
})

const path = require('path')
app.use("/public", express.static(path.join(__dirname, "public")));

const user_route= require ("./routes/userRoute")
app.use('/',user_route);

const admin_route = require("./routes/adminRoute")
app.use('/admin',admin_route);
app.listen(PORT,()=>{
  console.log(`The Brand Kicks server Running on ${PORT}`);
}) 

 