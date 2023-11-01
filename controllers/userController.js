const User = require("../models/userModel").User;
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const randomstring= require('randomstring')
const path = require("path");
const otpGenerator = require("otp-generator");
const Product = require("../models/productsModel").product;
const Banner = require('../models/bannerModel');
const Cart = require('../models/userModel').Cart;
const Address= require('../models/userModel').UserAddress;
const { reject } = require("promise");
const { response } = require("../routes/userRoute");
const Swal = require('sweetalert2'); 
const { log } = require("console");

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
        user: process.env.email,
        pass: process.env.password,
      },
    });

    const mailOptions = {
      from: process.env.email,
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



const resetPasswordMail = async (firstName,secondName,email,token)=>{
  try {
    const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user: process.env.email,
        pass: process.env.password,
      }
    })

    const mailOptions = {
      from: process.env.email,
      to:email,
      subject:"For Reset Password",
      html: `<p> Hi, ${firstName} ${secondName}, please click here to <a href="http://localhost:3000/forget-password?token=${token}"> Reset </a> your password</p>`
    }

    transporter.sendMail(mailOptions,function(error,info){
      if(error){
        console.log(error);
      }else{
        console.log("Email Has been Sent:-",info,response);
      }
    })
  } catch (error) {
    console.log(error);
  }
}

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
    
  
    res.render("home", { 
    currentPage:'home',
    products: products ,
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
          res.render("signup");
        }
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


const resendOTP = async (req,res)=>{
  try {
    const currentTime = Date.now()/1000
    if(req.session.otp.expiry!=null){
      if(currentTime>req.session.otp.expiry){
        console.log(expired,req.session.otp.expiry);
        const newDigit = otpGenerator.generate(6, { 
          digits: true,
          alphabets: false, 
          specialChars: false, 
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false 
      });

      req.session.otp.code= newDigit;
      const newExpiry = currentTime +45;
      req.session.otp.expiry= newExpiry
      sendVerificationEmail(req.session.email,req.session.otp.code)

      res.render('otpPage',{message:'message:OTP has send'})
        
      }else{
        res.render('otpPage',{message: "You can request a new otp after old otp expires"});
      }
    }else{
        res.send('please Register again')
      }
    }
  catch (error) {
    console.log(error);
  }
}

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

const forgetLoad = async (req,res)=>{
  try {
    res.render('forget')
  } catch (error) {
    console.log(error);    
  }
}

const forgetVerify = async (req,res)=>{
  try {
    const email = req.body.email
    const userData = await User.findOne({email:email})

    if(userData){
      if(userData.isVerified===false){
        res.render('forget',{message:"Please verify your mail"})
      }else{
        const randomString = randomstring.generate()
        const updatedData = await User.updateOne({email:email},
          {$set:{token:randomString}})

          resetPasswordMail(userData.firstName,userData.secondName,userData.email,randomString)
          res.render('forget',{message:"Please Check Your Mail to Reset Your Password"})
      }
    }else{
      res.render('forget',{message:"User email is Incorrect"})
    }
  } catch (error) {
    console.log(error);
  }
}


const forgetPasswordLoad = async (req,res)=>{
  try {
    const token = req.query.token
    
    const tokenData = await User.findOne({token:token})
    
    if(tokenData){
      res.render('forget-password',{user_id:tokenData._id})

    }else{
      res.render('404',{message:"Token is Invalid"})
    }
  } catch (error) {
    console.log(error);
  }
}

const resetPassword = async(req,res)=>{
  try {
    const password = req.body.password
    const user_id = req.body.user_id

    const spassword = await securePassword(password)

    const updatedData= await User.findByIdAndUpdate({_id:user_id},{$set:{password:spassword,token:''}})

    res.redirect('/login')
  } catch (error) {
    console.log(error);
  }
}

const loadShop = async (req,res)=>{
 try {
  const products= await Product.find({})
  res.render('shop',{
    currentPage:'shop',
    products:products,
    user:req.session.user_id
  })
 } catch (error) {
  console.log(error);
 }
}


const logout = async (req,res)=>{
  try {
    req.session.user_id= null;
    res.redirect('/')
  } catch (error) {
    console.log(error);
  }
}


const takeUserData = async (userId)=>{
  try {
    return new Promise ((resolve,reject)=>{
      User.findOne({_id:userId}).then((response)=>{
        resolve(response)
      })
    })
  } catch (error) {
    console.log(error.message);
  }
}

const profilePageLoad = async (req,res)=>{
  try {const takeUserData = async (userId)=>{
  try {
    return new Promise((resolve,reject)=>{
      User.findOne({ _id:userId}).then((response)=>{
        resolve(response);
      })
    })
  } catch (error) {
    console.log(error);
  }
}

  const userData = await takeUserData(req.session.user_id)
  const address = await Address.findOne({userId:req.session.user_id})
  if(address){
    res.render('profile',
    { currentPage:'home',
      users:userData,
      updatePassErr: req.session.updatePassErr,
      updatePass: req.session.updatePass,
      address:address.addresses,
      user:req.session.user_id},
      (err, html) => {
        if (!err) {
          // Reset session variables after rendering
          req.session.updatePassErr = false;
          req.session.updatePass = false;
          res.send(html);
        } else {
          console.log(err.message);
          // Handle rendering error here, if necessary
          res.status(500).send("Internal Server Error");
        }
      }
      
      )
  }else{
    res.render('profile',
    { currentPage:'home',
      address:0,
      updatePassErr: req.session.updatePassErr,
      updatePass: req.session.updatePass,
      users:userData,
      user:req.session.user_id},
      (err, html) => {
        if (!err) {
          // Reset session variables after rendering
          req.session.updatePassErr = false;
          req.session.updatePass = false;
          res.send(html);
        } else {
          console.log(err.message);
          // Handle rendering error here, if necessary
          res.status(500).send("Internal Server Error");
        }
      }
      )
  }
    
  } catch (error) {
    console.log(error);
  }
}



// const updateUserData = async (req, res) => {
//   try {
//     let userData = req.body;

//     await User.updateOne(
//       { _id: req.session.user_id },
//       {
//         $set: {
//           firstName: userData.firstName,
//           secondName: userData.secondName,
//           mobile: userData.mobile,
//           email: userData.email,
//         },
//       }
//     );

//     userData = await takeUserData(req.session.user_id);

//     res.json({ success: true }); // Send a JSON response to indicate success
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Failed to update profile' }); // Send an error response
//   }
// };

const updateUserData = async (req, res) => {
  try {
    let userData = req.body;

    await User.updateOne(
      { _id: req.session.user_id },
      {
        $set: {
          firstName: userData.firstName,
          secondName: userData.secondName,
          mobile: userData.mobile,
          email: userData.email,
        },
      }
    );

    userData = await takeUserData(req.session.user_id);

    // Send a success message using SweetAlert
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'User data has been successfully updated',
    });

    res.json({ success: true }); // Send a JSON response to indicate success
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update profile' }); // Send an error response
  }
};


const changePassword = async (req,res) =>{
  try {
    console.log("gettingggggg")
    let userDetails = await User.findOne({_id:req.session.user_id})
    bcrypt
    .compare(req.body.oldPassword,userDetails.password)
    .then(async (status)=>{
      if(status){
        let newSecurePassword = await bcrypt.hash(req.body.newPassword, 10);
          let change = await User.updateOne(
            { _id: userDetails._id },
            { $set: { password: newSecurePassword } }
          );
          console.log(change);
          req.session.updatePass = 1;
          res.redirect("/profile");
          console.log("password changed...");
        } else {
          console.log("wrong old password");
          req.session.updatePassErr = 1;
          res.redirect("/profile");
        }
      
    })
  } catch (error) {
    console.log(error);
  }
}


// const changePassword = async (req, res) => {
//   try {
//       const userDetails = await User.findOne({ _id: req.session.user_id });
//       bcrypt.compare(req.body.oldPassword, userDetails.password, async (error, status) => {
//           if (error) {
//               console.error(error);
//               res.json({ success: false });
//               return;
//           }

//           if (status) {
//               const newSecurePassword = await bcrypt.hash(req.body.newPassword, 10);
//               const change = await User.updateOne(
//                   { _id: userDetails._id },
//                   { $set: { password: newSecurePassword } }
//               );
//               console.log(change);
//               res.json({ success: true });
             
//           } else {
              
//               res.json({ success: false });
//           }
//       });
//   } catch (error) {
//       console.log(error);
//       res.json({ success: false });
//   }
// }



const addAddressFromProfile = async (req,res)=>{
  try {
    let addrData = req.body;
    let userAddress = await Address.findOne({ userId: req.session.user_id});

    if(!userAddress){

    
    userAddress = new Address({
      userId:req.session.user_id,
      addresses:[
        {
          country:addrData.country,
          fullName: addrData.fullName,
          mobileNumber: addrData.mobileNumber,
          city:addrData.city,
          state:addrData.state,
          pincode:addrData.pincode,
        }
      ]
    })
  }else{
    userAddress.addresses.push({
      country:addrData.country,
      fullName: addrData.fullName,
      mobileNumber:addrData.mobileNumber,
      city:addrData.city,
      state: addrData.state,
      pincode:addrData.pincode,
    })
  }

  const result = await userAddress.save();
  const total= await calculateTotalPrice(req.session.user_id)
  res.redirect('/profile');
  } catch (error) {
    console.log(error);
  }
}
const updateAddress = async (req, res) => {
  try {
    // console.log(req.body);
    let Addres = req.body;
    let userAddress = await Address.findOne({ userId: req.session.user_id });
    const selectedAddress = userAddress.addresses.find(
      (address) => address.id === req.body.adressId
    );

    selectedAddress.country = Addres.country;
    selectedAddress.fullName = Addres.fullName;
    selectedAddress.mobileNumber = Addres.mobileNumber;
    selectedAddress.pincode = Addres.pincode;
    selectedAddress.city = Addres.city;
    selectedAddress.state = Addres.state;
    await userAddress.save();

    res.redirect("/profile");
    // console.log(selectedAddress);
  } catch (error) {
    console.log(error.message);
  }
};


const addShippingAddress = async(req,res)=>{
  try {
    const addrData = req.body;
    const  userAddress = await Address.findOne({userId:req.session.user_id})
    if(!userAddress){
      userAddress= new Address({
        userId:req.session.user_id,
        addresses: [
          {
            country: addrData.country,
            fullName: addrData.fullName,
            mobileNumber: addrData.mobileNumber,
            city: addrData.city,
            state: addrData.state,
            pincode: addrData.pincode,
          }
        ]
      })
    } else {
      //if the user's address already exists, add a new address to array
      userAddress.addresses.push({
            country: addrData.country,
            fullName: addrData.fullName,
            mobileNumber: addrData.mobileNumber,
            city: addrData.city,
            state: addrData.state,
            pincode: addrData.pincode,
      })
    }

    let result = await userAddress.save();
    

    res.redirect('/checkout')
    } catch (error) {
    console.log(error);
  }
}


const deleteAddress = async (req,res) =>{
  try {
    const userAddress = await Address.findOne({userId:req.session.user_id})
    const addressToDelete = userAddress.addresses.findIndex(
      (address)=>address.id === req.body.id
    );
    if(addressToDelete===1){
      return res.status(404).json({remove:0});
    }
    userAddress.addresses.splice(addressToDelete,1);
    await userAddress.save();
    return res.json({remove:1})
  } catch (error) {
    console.log(error);
  }
}

const calculateTotalPrice= async (userId) =>{
  try {
    const cart=await Cart.findOne({user:userId}).populate(
      "products.product"
    );
    if(!cart){
      console.log("User does not have a cart");
    }

    let totalPrice = 0;
    for(const cartProduct of cart.products) {
      const {product,quantity }=cartProduct;
      const productSubtotal = product.product_price *quantity;
      totalPrice +=productSubtotal;
    }

    return totalPrice;
  } catch (error) {
    console.log(error);
  }
}

const updateCart = async (req,res) =>{
  try {
    console.log('updateCart')
    const user = req.session.user_id;
    const productID = req.body.productID;
    const quantity = req.body.quantity;


    const updatedCartItem = await Cart.findOneAndUpdate(
      {'products.product':productID,user:user},
      {$set:{'products.$.quantity':quantity}},
      {new :true}
    )

    console.log(updatedCartItem)

    res.json(updatedCartItem);
  } catch (error) {
    console.log(error);
  }
}






const cartPageLoad = async (req,res)=>{
  try {
    const userData = await takeUserData(req.session.user_id);
    const cartDetails = await Cart.findOne({user : req.session.user_id})
    .populate({
      path: "products.product",
      select :"product_name product_price category images.image1"
    })
    .exec();

    if(cartDetails ) {
      let total = await calculateTotalPrice(req.session.user_id)

      return res.render ('cart',{
        currentPage:'shop',
        user :userData ,
        cartItems: cartDetails,
        total,
      })
    }else {
      return res.render ('cart',{
        currentPage:'shop',
        user:userData,
        cartItems:0,
        total:0,
      })
    }
    res.render('cart',
    {user:req.session.user_id})
  } catch (error) {
    console.log(error);
  }
}



const addToCart = async (req,res)=>{
  try {
    const existingCart = await Cart.findOne({user:req.body.user});
    if (!existingCart){
      const cart = new Cart({
        user:req.body.user,
        products:[
          {
            product:req.body.id,
            quantity:1
          }
        ]      
      })
      const result= await cart.save();
      res.json({cart:1});
      
    }else{
      const productInCart = existingCart.products.find(
        (item)=>item.product.toString()===req.body.id.toString()
      );

      if(productInCart) {
        res.json({cart:2})
        
      }else {
        existingCart.products.push({
          product:req.body.id,
          quantity :1
        })
        const result = await existingCart.save()
        res.json({cart:1})
      }
      
    }
    
  } catch (error) {
    console.log(error);
  }
}

const removeCartItem = async (req,res) =>{
  try {
    const {user,product,qty} =req.body;
    const cart = await Cart.findOne({user:user});

    const qtyFind = cart.products.find(item=> item.product.toString()==product.toString())
    

    cart.products = cart.products.filter(
      (cartProduct)=> cartProduct.product.toString() !== product.toString()
    );
    
    let remove = await cart.save();

    res.json({remove:1});
    console.log("product removed");
  } catch (error) {
    console.log(error);
  }
}


const aboutusLoad = async (req,res)=>{
  try {
    res.render('aboutus',{
      currentPage:'aboutus',
      user:req.session.user_id
    })
  } catch (error) {
    console.log(error);
  }
}

const contactLoad = async (req,res)=>{
  try {
    res.render('contact',{
      currentPage:'contact',
      user:req.session.user_id
    })
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
  resendOTP,
  loadHome,
  verifyLogin,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  loadShop,
  logout,
  profilePageLoad,
  addAddressFromProfile,
  aboutusLoad,
  contactLoad,
  cartPageLoad,
  addToCart,
  updateCart,
  removeCartItem,
  addShippingAddress,
  updateAddress,
  deleteAddress,
  updateUserData,
  changePassword,
};
