const User = require("../models/userModel").User;
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const path = require("path");
const otpGenerator = require("otp-generator");
const Product = require("../models/productsModel").product;
const Banner = require('../models/bannerModel')

//=============code for securing the password=================================//

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

//===================code for generating the otp Random Number============================//

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



//===================code for sending the verification Email==============================//
const sendVerificationEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "brandreselling15@gmail.com",
        pass: "uzpp awea tiqy iwnz",
      },
    });

    const mailOptions = {
      from: "brandreselling15@gmail.com",
      to: email,
      subject: "Verify Your Email",
      html: `<p>HI,
            Welcome to Brand Kicks!,
            Your OTP is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};


//==================to load the Login Page==============================//

const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error);
  }
};


//=========================to load the Home Page================================//
const loadHome = async (req, res) => {
  try {
    const products = await Product.find({});
    const banners = await Banner.find({})
    
    console.log(req.session.user_id);
  
    res.render("home", { products: products ,
    banners:banners,
    user:req.session.user_id});
  } catch (error) {
    console.log(error);
  }
};

//===================to load the signup page===============================//

const loadRegister = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error);
  }
};

//=================to load the verify Otp Page==========================//

const showverifyOTPPage = async (req, res) => {
  try {
    res.render("otpPage");
  } catch (error) {
    console.log(error);
  }
};


//==================code for inserting the User Data==============>

const insertUser = async (req, res) => {
  try {
    // Generate OTP
    const otpCode = generateOTP();
    const otpcurTime = Date.now() / 1000;
    const otpExpiry = otpcurTime + 180;

    const userCheck = await User.findOne({ email: req.body.email });
    if (userCheck) {
      res.render("signup", { message: "User already exist" });
    } else {
      const spassword = await securePassword(req.body.password);
      req.session.firstName = req.body.firstName;
      req.session.secondName = req.body.secondName;
      req.session.mobile = req.body.mobile;
      req.session.email = req.body.email;
      if (
        req.body.firstName &&
        req.body.email &&
        req.session.secondName &&
        req.session.mobile
      ) {
        if (req.body.password === req.body.cpassword) {
          req.session.password = spassword;
          req.session.otp = {
            code: otpCode,
            expiry: otpExpiry,
          };
          // Send OTP to the user's email
          sendVerificationEmail(req.session.email, req.session.otp.code);
          res.render("otpPage");
        } else {
          res.render("signup", { message: "Password doesn't match" });
        }
      } else {
        res.render("signup", { message: "Please enter all details" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

//==================code for verifying the otp============================//

const verifyOTP = async (req, res) => {
  try {
    if (req.body.otp === req.session.otp.code) {
      const user = new User({
        firstName: req.session.firstName,
        secondName: req.session.secondName,
        email: req.session.email,
        mobile: req.session.mobile,
        password: req.session.password,
        isVerified: 1,
      });

      const result = await user.save();
      res.redirect("/login");
    } else {
      res.render("otpPage", { message: "invalid OTP" });
    }
  } catch (error) {
    console.log(error);
  }
};


//==========================code for verifying the login======================//


const verifyLogin = async (req, res, next) => {
  try {
    const Email = req.body.email;
    const Password = req.body.password;

    const userData = await User.findOne({ email: Email });
    if (userData) {
      if (userData.isBlock == false) {
        const passwordMatch = await bcrypt.compare(Password, userData.password);

        if (passwordMatch) {
          if (userData.is_verified == false) {
            req.session.user_id = userData._id;
            res.render("login", { message: "please verify your mail" });
          } else {
            req.session.user_id = userData._id;

            res.redirect("/");
          }
        } else {
          res.render("login", { message: "Email and  password is incorrect" });
        }
      } else {
        res.render("login", { message: "This User is blocked" });
      }
    } else {
      res.render("login", { message: "Email and  password is incorrect" });
    }
  } catch (err) {
    next(err);
  }
};


const loadShop = async (req,res)=>{
 try {
  const products= await Product.find({})
  res.render('shop',{
    products:products,
    user:req.session.user_id
  })
 } catch (error) {
  console.log(error);
 }
}


const logout = async (req,res)=>{
  try {
    req.session.destroy()
    res.redirect('/')
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  loginLoad,
  loadRegister,
  insertUser,
  showverifyOTPPage,
  verifyOTP,
  loadHome,
  verifyLogin,
  loadShop,
  logout
};
