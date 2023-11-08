const mongoose = require ('mongoose');

const express= require ('express');
const app= express();
const session = require("express-session");
const config= require("./config/config");
const flash= require('express-flash')

app.use(session({
  secret:config.sessionKey,
  cookie:{maxAge:86400000},
  resave: false,
  saveUninitialized:true,
}))

app.use(flash())

const dotenv=require("dotenv");
dotenv.config();
const PORT= process.env.PORT ;
mongoose.connect(process.env.MONGODB_URI).then(()=>{
  console.log("Mongodb Connected...");
})

const path = require('path')
app.use("/public", express.static(path.join(__dirname, "public")));

const nocache= require('nocache')
const disable = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '1');
  next();
}

app.use(nocache());

const user_route= require ("./routes/userRoute")
app.use('/',disable,user_route);

const admin_route = require("./routes/adminRoute")
app.use('/admin',disable,admin_route);

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
})

app.listen(PORT,()=>{
  console.log(`The Brand Kicks server Running on ${PORT}`);
}) 

 