const User = require('../models/userModel') 
const nodemailer = require("nodemailer")
const bcrypt = require('bcrypt')
const path = require("path")
const otpGenerator = require("otp-generator")

const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    }
    catch (error)
    {
        console.log(error)
    }
}

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendVerificationEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'brandreselling15@gmail.com',
                pass: 'uzpp awea tiqy iwnz',
            },
        });

        const mailOptions = {
            from: 'brandreselling15@gmail.com',
            to: email,
            subject: 'Verify Your Email',
            html: `<p>HI,
            Welcome to Brand Kicks!,
            Your OTP is: <strong>${otp}</strong></p>`,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}


const loginLoad = async(req,res)=>{

    try{
        res.render('login')
    }
    catch(error){
        console.log(error)
    }
}

const loadHome = async (req, res) => {
    try {
      res.render('home');
    } catch (error) {
      console.log(error);
    }
  }

const loadRegister = async(req,res)=>{
    try {
        res.render('signup')
    }
    catch (error)
    {
        console.log(error)
    }
}


const showverifyOTPPage = async (req, res) => {
    try {
      res.render('otpPage');
    } catch (error) {
      console.log(error);
    }
  }

//   const insertUser = async (req, res) => {
//     try {
        
//         // Generate OTP
//         const otpCode = generateOTP();
//         const otpExpiry = new Date();
//         otpExpiry.setMinutes(otpExpiry.setMinutes() + 1); // OTP expires in 1 minutes

//         const userCheck = await User.findOne({email:req.body.email})
//         if(userCheck)
//         {
//             res.render('registration',{message:"User already exist"});
//         }
//         else{
//             const spassword = await securePassword(req.body.password);
//             req.session.fname = req.body.fname;
//             req.session.lname = req.body.lname;
//             req.session.mobileno = req.body.mobileno;
//             req.session.email = req.body.email;
//             if(req.body.fname && req.body.email && req.session.lname && req.session.mobileno){
//                 if(req.body.password === req.body.cpassword) {
//                     req.session.password = spassword;
//                     req.session.otp = {
//                         code: otpCode,
//                         expiry: otpExpiry,
//                     };        
//                         // Send OTP to the user's email
//                         sendVerificationEmail(req.session.email, req.session.otp.code);
//                         res.render("user-otp")
//                     } else {
//                         res.render("registration",{message: "Password doesn't match"})
//                     }
//                 }
//                 else{
//                     res.render("registration",{message: "Please enter all details"})
//                 }
//                 }
         


//     } catch (error) {
//         console.log(error.message);
//     }
// }

const insertUser = async (req, res) => {
    try {
        
        // Generate OTP
        const otpCode = generateOTP();
        const otpcurTime = Date.now()/1000
        const otpExpiry = otpcurTime + 60

        const userCheck = await User.findOne({email:req.body.email})
        if(userCheck)
        {
            res.render('signup',{message:"User already exist"});
        }
        else{
            const spassword = await securePassword(req.body.password);
            req.session.firstName = req.body.firstName;
            req.session.secondName = req.body.secondName;
            req.session.mobile = req.body.mobile;
            req.session.email = req.body.email;
            if(req.body.firstName && req.body.email && req.session.secondName && req.session.mobile){
                if(req.body.password === req.body.cpassword) {
                    req.session.password = spassword;
                    req.session.otp = {
                        code: otpCode,
                        expiry: otpExpiry,
                    };        
                        // Send OTP to the user's email
                        sendVerificationEmail(req.session.email, req.session.otp.code);
                        res.render("otpPage")
                    } else {
                        res.render("signup",{message: "Password doesn't match"})
                    }
                }
                else{
                    res.render("signup",{message: "Please enter all details"})
                }
                }
         


    } catch (error) {
        console.log(error);
    }
}


const verifyOTP = async (req, res)=>{
    try {
        if(req.body.otp === req.session.otp.code){
            const user = new User({
                firstName: req.session.firstName,
                secondName: req.session.secondName,
                email: req.session.email,
                mobile: req.session.mobile,
                password: req.session.password,
                isVerified:1
            });

            const result = await user.save()
            res.redirect("/login")
        }
        else{
            res.render('otpPage',{message:"invalid OTP"});
        }
    } catch (error) {
        console.log(error);
    }
}


// const resendOTP = async (req,res)=>{
//     try{
//         const currentTime = Date.now()/1000;
//         console.log("current",currentTime)
//         if (req.session.otp.expiry != null) {
//         if(currentTime > req.session.otp.expiry){
//             console.log("expire",req.session.otp.expiry);
//             const newDigit = otpGenerator.generate(6, { 
//                 digits: true,
//                 alphabets: false, 
//                 specialChars: false, 
//                 upperCaseAlphabets: false,
//                 lowerCaseAlphabets: false 
//             });
//                 req.session.otp.code = newDigit;
//                 sendVerificationEmail(req.session.email, req.session.otp.code);
//                 res.render("user-otp",{message:"OTP has been send"});
//             }else{
//                 res.render("user-otp",{message: "You can request a new otp after old otp expires"});
//             }
//         }
//         else{
//             res.send("Please register again")
//         }
//     }
//     catch (error)
//     {
//         console.log(error.message)
//     }
// }

const verifyLogin = async (req, res,next) => {
    try {
        const Email = req.body.email
        const Password = req.body.password

        const userData = await User.findOne({ email:Email})
        if (userData) {

            if (userData.isBlock == false) {


                const passwordMatch = await bcrypt.compare(Password, userData.password)

                if (passwordMatch) {
                    if (userData.is_verified == false) {

                        res.render('login', { message: "please verify your mail" })
                    }
                    else {


                        req.session.userid = userData._id

                        res.redirect('/')
                    }
                }
                else {
                    res.render('login', { message: "Email and  password is incorrect" })
                }

            } else {

                res.render('login', { message: "This User is blocked" })
            }
        }
        else {
            res.render('login', { message: "Email and  password is incorrect" })

        }
    }
    catch (err) {

        next(err)
    }
}

module.exports = {
    loginLoad,
    loadRegister,
    insertUser,
    showverifyOTPPage,
    verifyOTP, 
    loadHome,
    verifyLogin
    // resendOTP
    //sendVerificationEmail
}

// my old below 


// const User = require("../models/userModel");
// const bcrypt = require("bcrypt");
// const nodemailer = require('nodemailer')
// const otpGenerator= require('otp-generator')










// const securePassword = async (password)=>{
// try {
//   const passwordHash = await bcrypt.hash(password, 10);
//   return passwordHash;
// } catch (error) {
//   console.log(error);
// }
// }

// const generateOtp= ()=>{
//   const otp = otpGenerator.generate(6, {
//     upperCaseAlphabets: false,
//     specialChars : false,
//     lowerCaseAlphabets:false
//   });
//   return otp;
// }

// //====================================FOR SENDING EMAIL=====================================//

// const sendverificationMail= async (email,otp)=>{
//   try {
//     console.log("mail option");
//     const transporter = nodemailer.createTransport({
//       host:"smtp.gmail.com",
//       port:587,
//       secure:false,
//       requireTLS:true,
//       auth:{
//         user:process.env.email,
//         pass:process.env.password
//       },
//     })
//     const mailOptions= {
//       from:process.env.email,
//       to:email,
//       subject: "For verification otp",
//       text: `Hi,
//       Welcome to Brand Kicks!

//       Your OTP is : ${otp}`
//     };
//     transporter.sendMail(mailOptions,function(error, info){
//       if(error) {
//         console.log(error);
//       }else {
//         console.log("Email has been send",info.response);
//       }
//     })
//   } catch (error) {
//     console.log(error);
//   }
// };




// const loadLogin = async (req,res)=>{
//   try {
//     res.render('login')
//   } catch (error) {
//     console.log(error);
//   }
// }

// const loadSignup = async (req,res)=>{
//  try {
//   res.render('signup')
//  } catch (error) {
//   console.log(error);
//  } 
// };

// const otpLoad= async (req,res)=>{
//   try {
//     res.render('otpPage')
//   } catch (error) {
//     console.log(error);
//   }
// }

// const tempStoreUserData= async (req,res) =>{
//   try {
//     const spassword= await securePassword(req.body.password);
//     const userData ={
//       firstName: req.body.firstName,
//       secondName: req.body.secondName,
//       email: req.body.email,
//       mobile: req.body.mobile,
//       password: spassword
//     }


//     const existingUser = await User.findOne({ email: userData.email });
//     if (existingUser) {
     
//       res.render('signup',{message:"Already Existing Account, Please Login"});
//       return; 
//     }

//     req.session.userData = userData;

//     const otp= generateOtp();
//     userOtp= otp
//     req.session.otpTimestamp = Date.now();

//     console.log(userOtp);
//     sendverificationMail(userData.email,otp)

//     res.redirect('/otpVerify');

//   } catch (error) {
//     console.log(error);
//   }
// }



// // const verifyLogin =async (req,res)=>{
// // try {
// //   const email= req.body.email;
// //   const password =req.body.password ;

// //   const userData= await User.findOne({email: email});
// //   if(userData){
// //     const passwordMatch= await bcrypt.compare(password,userData.password);
// //     console.log("password Match"+passwordMatch);
// //     if(passwordMatch){
// //       req.session.user=userData;
// //       res.redirect('/')
// //     }else{
// //       res.redirect('/login?message=The password is incorrect')
// //     }
// //   }else{
// //     console.log("userdata not found");
// //     res.redirect('/login?message=The code is incorrect')
// //   }
// // } catch (error) {
// //   console.log(error);
// // }
// // };

// const verifyLogin = async (req, res) => {
//   try {
//     const email = req.body.email;
//     const password = req.body.password;

//     // Find the user by email
//     const userData = await User.findOne({ email: email });
    
//     if (userData) {
//       // Compare the provided password with the stored hashed password
//       const passwordMatch = await bcrypt.compare(password, userData.password);

//       if (passwordMatch) {
//         // If the password matches, set the user in the session and redirect
//         req.session.user = userData;
//         res.redirect('/');
//       } else {
//         // If the password doesn't match, redirect with an error message
//         res.redirect('/login?message=The password is incorrect');
        
//       }
//     } else {
//       // If the user is not found, redirect with an error message
//       res.redirect('/login?message=Email not found');
//     }
//   } catch (error) {
//     console.error(error);
//     // Handle any errors that occur during the process
//     res.redirect('/login?message=An error occurred');
//   }
// };




// const verifyotpAndinsertUser= async (req,res)=>{
//   try {
//     const userotp=req.body.otp;
//     const otpTimestamp = req.session.otpTimestamp;

//     if(Date.now()- otpTimestamp <=60000){

    
//     if(userOtp==userotp){
//       const userData=req.session.userData;

//       const User= await insertUser(userData);
//       if(User){
//         res.redirect('/')
//       }else{
//         res.redirect('/signup')
//       }
//       }else{
//         res.redirect('/signup')
//       }
//     }else{
//       res.redirect('/otpPage')
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }


// const insertUser = async (userData)=>{
//   try {
   
//     const user =new User({
//       firstName: userData.firstName,
//       secondName:userData.secondName,
//       email:userData.email,
//       mobile:userData.mobile,
//       password:userData.password,
//       status:1
//     })

//     const savedUserData = await user.save()
//     return savedUserData;
    
//   } catch (error) {
//     console.log(error);
//   }
// }

// const loadHome = async (req,res)=>{
//   try {
//     res.render('home')
//   } catch (error) {
//     console.log(error);
//   }
// }

// module.exports={
//   loadLogin,
//   loadSignup,
//   insertUser,
//   verifyLogin,
//   loadHome,
//   sendverificationMail,
//   tempStoreUserData,
//   otpLoad,
//   verifyotpAndinsertUser,

  
  
// }