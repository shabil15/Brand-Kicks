const User = require('../models/userModels/userModel') 
const nodemailer = require("nodemailer")
const bcrypt = require('bcrypt')
const path = require("path")

const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    }
    catch (error)
    {
        console.log(error.message)
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
                user: 'aswinpc9@gmail.com',
                pass: 'monq qcbh bhdy elod',
            },
        });

        const mailOptions = {
            from: 'aswinpc9@gmail.com',
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error.message);
    }
}


const loginLoad = async(req,res)=>{

    try{
        res.render('login')
    }
    catch(error){
        console.log(error.message)
    }
}

const loadRegister = async(req,res)=>{
    try {
        res.render('registration')
    }
    catch (error)
    {
        console.log(error.message)
    }
}


const showverifyOTPPage = async (req, res) => {
    try {
      res.render('user-otp');
    } catch (error) {
      console.log(error.message);
    }
  }

  const insertUser = async (req, res) => {
    try {
        
        // Generate OTP
        const otpCode = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 15); // OTP expires in 15 minutes

        const userCheck = await User.findOne({email:req.body.email})
        if(userCheck)
        {
            res.send("user already exist");
        }
        else{
            const spassword = await securePassword(req.body.password);
            req.session.fname = req.body.fname;
            req.session.lname = req.body.lname;
            req.session.mobileno = req.body.mobileno;
            req.session.email = req.body.email;
            if(req.body.fname && req.body.email && req.session.lname && req.session.mobileno){
                if(req.body.password === req.body.cpassword) {
                    req.session.password = spassword;
                    req.session.otp = {
                        code: otpCode,
                        expiry: otpExpiry,
                    };        
                        // Send OTP to the user's email
                        sendVerificationEmail(req.session.email, req.session.otp.code);
                        res.render("user-otp")
                    } else {
                        res.render("registration",{message: "Password doesn't match"})
                    }
                }
                else{
                    res.render("registration",{message: "Please enter all details"})
                }
                }
         


    } catch (error) {
        console.log(error.message);
    }
}

const verifyOTP = async (req, res)=>{
    try {
        if(req.body.otp === req.session.otp.code){
            console.log("entr")

            const user = new User({
                firstName: req.session.fname,
                lastName: req.session.lname,
                email: req.session.email,
                mobile: req.session.mobileno,
                password: req.session.password,
                isVerified:1
            });

            const result = await user.save()
            res.redirect("/")
        }
        else{
            res.render('user-otp',{message:"invalid OTP"});
        }
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    loginLoad,
    loadRegister,
    insertUser,
    showverifyOTPPage,
    verifyOTP, 
    sendVerificationEmail
}