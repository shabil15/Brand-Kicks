//=========================  dependecies=====================================//

const User = require("../models/userModel").User;
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const path = require("path");
const otpGenerator = require("otp-generator");
const Product = require("../models/productsModel").product;
const Category = require("../models/productsModel").category;
const Banner = require("../models/bannerModel");
const Cart = require("../models/userModel").Cart;
const Address = require("../models/userModel").UserAddress;
const Coupon = require("../models/couponModel").Coupon;
const Order = require("../models/orderModel").Order;
const shortid = require("shortid");
const { reject } = require("promise");
const { response } = require("../routes/userRoute");
const Swal = require("sweetalert2");
const { log } = require("console");
const flash = require("flash");

//=============code for securing the password============================================================//

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

//===================code for generating the otp Random Number==========================================//

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//===================code for sending the verification Email===========================================//
const sendVerificationEmail = async (email, otp, next) => {
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
    next(error);
  }
};

//========================= to send the reset Password Mail=================================================//

const resetPasswordMail = async (firstName, secondName, email, token) => {
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
      subject: "For Reset Password",
      html: `<p> Hi, ${firstName} ${secondName}, please click here to <a href="http://localhost:3000/forget-password?token=${token}"> Reset </a> your password</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email Has been Sent:-", info, response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//==================to load the Login Page=================================================================//

const loginLoad = async (req, res, next) => {
  try {
    res.render("login");
  } catch (error) {
    next(error);
  }
};

//=========================to load the Home Page============================================================//
const loadHome = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate("offer");
    const banners = await Banner.find({ visibility: true });
    const reviews = products.reviews

    res.render("home", {
      currentPage: "home",
      products: products,
      banners: banners,
      user: req.session.user_id,
    });
  } catch (error) {
    next(error);
  }
};

//===================to load the signup page================================================================//

const loadRegister = async (req, res, next) => {
  try {
    res.render("signup");
  } catch (error) {
    next(error);
  }
};

//=================to load the verify Otp Page===================================================================//

const showverifyOTPPage = async (req, res, next) => {
  try {
    res.render("otpPage");
  } catch (error) {
    next(error);
  }
};

//==================code for inserting the User Data to session ==================================================================>

const insertUser = async (req, res, next) => {
  try {
    // Generate OTP
    const otpCode = generateOTP();
    const otpcurTime = Date.now() / 1000;
    const otpExpiry = otpcurTime + 60;

    const userCheck = await User.findOne({ email: req.body.email });
    if (userCheck) {
      res.render("signup", { message: "User already exist" });
    } else {
      const spassword = await securePassword(req.body.password);
      req.session.firstName = req.body.firstName;
      req.session.secondName = req.body.secondName;
      req.session.mobile = req.body.mobile;
      req.session.email = req.body.email;

      // =========================== referral ===============================//

      if (req.body.referralCode) {
        const referringUser = await User.findOne({
          referralCode: req.body.referralCode,
        });

        if (referringUser) {
          req.session.referralUserId = referringUser._id;
        } else {
          res.render("signup", {
            message: "invalid referal code,Please Use valid code",
          });
        }
      }

      const referralCode = shortid.generate();
      req.session.referralCode = referralCode;

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
    next(error);
  }
};

//==================code for verifying the otp=========================================================================//

const verifyOTP = async (req, res, next) => {
  try {
    if (req.body.otp === req.session.otp.code) {
      const user = new User({
        firstName: req.session.firstName,
        secondName: req.session.secondName,
        email: req.session.email,
        mobile: req.session.mobile,
        password: req.session.password,
        referralCode: req.session.referralCode,
        isVerified: 1,
      });

      const result = await user.save();

      if (req.session.referralUserId) {
        const referringUser = await User.findById(req.session.referralUserId);

        const reward = 100;

        referringUser.wallet += reward;
        referringUser.walletHistory.push({
          transactionDate: new Date(),
          transactionAmount: reward,
          transactionDetails: "Referal Reward",
          transactionType: "Credit",
        });

        await referringUser.save();

        result.wallet += reward;
        result.walletHistory.push({
          transactionDate: new Date(),
          transactionAmount: reward,
          transactionDetails: "Referal Reward",
          transactionType: "Credit",
        });
        await result.save();
      }

      res.render("login", {
        message: "User Created Successfully,Plese Sign In",
      });
    } else {
      res.render("otpPage", { message: "invalid OTP" });
    }
  } catch (error) {
    next(error);
  }
};

//============================ to resend the OTP ======================================================================//

const resendOTP = async (req, res, next) => {
  try {
    const currentTime = Date.now() / 1000;
    if (req.session.otp.expiry != null) {
      if (currentTime > req.session.otp.expiry) {
        const newDigit = otpGenerator.generate(6, {
          digits: true,
          alphabets: false,
          specialChars: false,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
        });

        req.session.otp.code = newDigit;
        const newExpiry = currentTime + 45;
        req.session.otp.expiry = newExpiry;
        sendVerificationEmail(req.session.email, req.session.otp.code);

        res.render("otpPage", { message: "message:OTP has send" });
      } else {
        res.render("otpPage", {
          message: "You can request a new otp after old otp expires",
        });
      }
    } else {
      res.send("please Register again");
    }
  } catch (error) {
    next(error);
  }
};

//==========================code for verifying the login===============================================================//

const verifyLogin = async (req, res, next) => {
  try {
    const Email = req.body.email;
    const Password = req.body.password;

    const userData = await User.findOne({ email: Email });
    if (userData) {
      if (userData.isBlock == false) {
        if (!userData.password) {
          res.render("login", { message: "Please Sign In With Google" });
        }
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

//====================== to Load the Forget Page Load ===================================================================//

const forgetLoad = async (req, res, next) => {
  try {
    res.render("forget");
  } catch (error) {
    next(error);
  }
};

//========================= to verify the forget mail=====================================================================//

const forgetVerify = async (req, res, next) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.isVerified === false) {
        res.render("forget", { message: "Please verify your mail" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );

        resetPasswordMail(
          userData.firstName,
          userData.secondName,
          userData.email,
          randomString
        );
        res.render("forget", {
          message: "Please Check Your Mail to Reset Your Password",
        });
      }
    } else {
      res.render("forget", { message: "User email is Incorrect" });
    }
  } catch (error) {
    next(error);
  }
};

//============================to Load the forget password Load ====================================================//

const forgetPasswordLoad = async (req, res, next) => {
  try {
    const token = req.query.token;

    const tokenData = await User.findOne({ token: token });

    if (tokenData) {
      res.render("forget-password", { user_id: tokenData._id });
    } else {
      res.render("404", { message: "Token is Invalid" });
    }
  } catch (error) {
    next(error);
  }
};

//=============================== to reset the password ===============================================//

const resetPassword = async (req, res, next) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const spassword = await securePassword(password);

    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: spassword, token: "" } }
    );

    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

//======================================= to logout for user =====================================================//

const logout = async (req, res, next) => {
  try {
    req.session.user_id = null;
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

//======================================== to take userData  =================================================//

const takeUserData = async (userId) => {
  try {
    return new Promise((resolve, reject) => {
      User.findOne({ _id: userId }).then((response) => {
        resolve(response);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

//===================================  to load the profile Page ===================================================//

const profilePageLoad = async (req, res, next) => {
  try {
    const takeUserData = async (userId) => {
      try {
        return new Promise((resolve, reject) => {
          User.findOne({ _id: userId }).then((response) => {
            resolve(response);
          });
        });
      } catch (error) {}
    };

    const userData = await takeUserData(req.session.user_id);
    const address = await Address.findOne({ userId: req.session.user_id });
    const coupons = await Coupon.find();

    if (address) {
      res.render(
        "profile",
        {
          currentPage: "profile",
          users: userData,
          coupons,
          updatePassErr: req.session.updatePassErr,
          updatePass: req.session.updatePass,
          address: address.addresses,
          user: req.session.user_id,
        },
        (err, html) => {
          if (!err) {
            // Reset session variables after rendering
            req.session.updatePassErr = false;
            req.session.updatePass = false;
            res.send(html);
          } else {
            // Handle rendering error here, if necessary
            res.status(500).send("Internal Server Error");
          }
        }
      );
    } else {
      res.render(
        "profile",
        {
          currentPage: "home",
          address: 0,
          coupons,
          updatePassErr: req.session.updatePassErr,
          updatePass: req.session.updatePass,
          users: userData,
          user: req.session.user_id,
        },
        (err, html) => {
          if (!err) {
            // Reset session variables after rendering
            req.session.updatePassErr = false;
            req.session.updatePass = false;
            res.send(html);
          } else {
            // Handle rendering error here, if necessary
            res.status(500).send("Internal Server Error");
          }
        }
      );
    }
  } catch (error) {
    next(error);
  }
};

//======================================== to update the User Data =======================================//

const updateUserData = async (req, res, next) => {
  try {
    let userData = req.body;

    await User.updateOne(
      { _id: req.session.user_id },
      {
        $set: {
          firstName: userData.firstName,
          secondName: userData.secondName,
          mobile: userData.mobile,
        },
      }
    );

    userData = await takeUserData(req.session.user_id);

    // Send a success message using SweetAlert
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "User data has been successfully updated",
    });

    res.json({ success: true }); // Send a JSON response to indicate success
  } catch (error) {
    next(error);
  }
};

//=================================== function to change the user Password===================================//

const changePassword = async (req, res, next) => {
  try {
    let userDetails = await User.findOne({ _id: req.session.user_id });
    bcrypt
      .compare(req.body.oldPassword, userDetails.password)
      .then(async (status) => {
        if (status) {
          let newSecurePassword = await bcrypt.hash(req.body.newPassword, 10);
          let change = await User.updateOne(
            { _id: userDetails._id },
            { $set: { password: newSecurePassword } }
          );

          req.session.updatePass = 1;
          res.redirect("/profile");
        } else {
          req.session.updatePassErr = 1;
          res.redirect("/profile");
        }
      });
  } catch (error) {
    next(error);
  }
};

//=========================================== to Add address From the User Profile======================================//

const addAddressFromProfile = async (req, res) => {
  try {
    let addrData = req.body;
    let userAddress = await Address.findOne({ userId: req.session.user_id });

    if (!userAddress) {
      userAddress = new Address({
        userId: req.session.user_id,
        addresses: [
          {
            country: addrData.country,
            fullName: addrData.fullName,
            mobileNumber: addrData.mobileNumber,
            city: addrData.city,
            state: addrData.state,
            pincode: addrData.pincode,
          },
        ],
      });
    } else {
      userAddress.addresses.push({
        country: addrData.country,
        fullName: addrData.fullName,
        mobileNumber: addrData.mobileNumber,
        city: addrData.city,
        state: addrData.state,
        pincode: addrData.pincode,
      });
    }

    const result = await userAddress.save();
    const total = await calculateTotalPrice(req.session.user_id);
    res.redirect("/profile");
  } catch (error) {
    
  }
};

//=============================== to update the Address of the user from the Profile ========================================================//

const updateAddress = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

//================================ to add address from the checkout Page in the user side ============================//

const addShippingAddress = async (req, res, next) => {
  try {
    const addrData = req.body;
    const userAddress = await Address.findOne({ userId: req.session.user_id });
    if (!userAddress) {
      userAddress = new Address({
        userId: req.session.user_id,
        addresses: [
          {
            country: addrData.country,
            fullName: addrData.fullName,
            mobileNumber: addrData.mobileNumber,
            city: addrData.city,
            state: addrData.state,
            pincode: addrData.pincode,
          },
        ],
      });
    } else {
      //if the user's address already exists, add a new address to array
      userAddress.addresses.push({
        country: addrData.country,
        fullName: addrData.fullName,
        mobileNumber: addrData.mobileNumber,
        city: addrData.city,
        state: addrData.state,
        pincode: addrData.pincode,
      });
    }

    let result = await userAddress.save();

    res.redirect("/checkout");
  } catch (error) {
    next(error);
  }
};

//============================= to delete the address of the user from user Profile ====================================//

const deleteAddress = async (req, res, next) => {
  try {
    const userAddress = await Address.findOne({ userId: req.session.user_id });
    const addressToDelete = userAddress.addresses.findIndex(
      (address) => address.id === req.body.id
    );
    if (addressToDelete === 1) {
      return res.status(404).json({ remove: 0 });
    }
    userAddress.addresses.splice(addressToDelete, 1);
    await userAddress.save();
    return res.json({ remove: 1 });
  } catch (error) {
    next(error);
  }
};

//============================== to calculate the total Price of the cart================================================//

const calculateTotalPrice = async (userId) => {
  try {
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );
    if (!cart) {
      console.log("User does not have a cart");
    }

    let totalPrice = 0;
    for (const cartProduct of cart.products) {
      const { product, quantity } = cartProduct;
      if (product.discountedPrice > 0) {
        const productSubtotal = Math.floor(product.discountedPrice) * quantity;
        totalPrice += productSubtotal;
      } else {
        const productSubtotal = product.product_price * quantity;
        totalPrice += productSubtotal;
      }
    }

    return totalPrice;
  } catch (error) {
    console.log(error);
  }
};

//================================== to update the cart items quantity ================================================//

const updateCart = async (req, res, next) => {
  try {
    const user = req.session.user_id;
    const productID = req.body.productID;
    const quantity = req.body.quantity;

    if (quantity > 10) {
      req.flash("error", "Quantity limit reached");
      return res.redirect("/cart"); // Redirect to the cart page
    }

    const updatedCartItem = await Cart.findOneAndUpdate(
      { "products.product": productID, user: user },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    );

    res.json(updatedCartItem);
  } catch (error) {
    next(error);
  }
};
//=============================== get the stock count ===================================//

const getProductStock = async (req, res, next) => {
  const productID = req.query.productID;
  try {
    const product = await Product.findById(productID);

    if (product) {
      res.json({ stock: product.stock });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    next(error);
  }
};
//======================================== to load the Cart Page ================================================//

const cartPageLoad = async (req, res, next) => {
  try {
    const userData = await takeUserData(req.session.user_id);
    const cartDetails = await Cart.findOne({ user: req.session.user_id })
      .populate({
        path: "products.product",
        select:
          "product_name product_price discountedPrice category images.image1",
      })
      .exec();

    if (cartDetails) {
      let total = await calculateTotalPrice(req.session.user_id);

      return res.render("cart", {
        currentPage: "shop",
        user: userData,
        cartItems: cartDetails,
        total,
      });
    } else {
      return res.render("cart", {
        currentPage: "shop",
        user: userData,
        cartItems: 0,
        total: 0,
      });
    }
    res.render("cart", { user: req.session.user_id });
  } catch (error) {
    next(error);
  }
};

//================================== to add a product to Cart ================================================//

const addToCart = async (req, res, next) => {
  try {
    const existingCart = await Cart.findOne({ user: req.body.user });
    const user = req.session.user_id;
    if (!existingCart) {
      const cart = new Cart({
        user: req.body.user,
        products: [
          {
            product: req.body.id,
            quantity: 1,
          },
        ],
      });
      const result = await cart.save();
      res.json({ cart: 1 });
    } else {
      const productInCart = existingCart.products.find(
        (item) => item.product.toString() === req.body.id.toString()
      );

      if (productInCart) {
        res.json({ cart: 2 });
      } else {
        const updatedCart = await Cart.findOne({ user: user });
        let updatedCount = updatedCart ? updatedCart.products.length : 0;
        updatedCount = updatedCount + 1;

        existingCart.products.push({
          product: req.body.id,
          quantity: 1,
        });
        const result = await existingCart.save();
        res.json({ cart: 1, cartCount: updatedCount });
      }
    }
  } catch (error) {
    next(error);
  }
};

//==================================== to remove  a product from Cart =====================================================//

const removeCartItem = async (req, res, next) => {
  try {
    const { user, product, qty } = req.body;
    const cart = await Cart.findOne({ user: user });

    const qtyFind = cart.products.find(
      (item) => item.product.toString() == product.toString()
    );

    cart.products = cart.products.filter(
      (cartProduct) => cartProduct.product.toString() !== product.toString()
    );

    let remove = await cart.save();

    res.json({ remove: 1 });
  } catch (error) {
    next(error);
  }
};

//======================================= to load the about Us page ====================================================//

const aboutusLoad = async (req, res, next) => {
  try {
    res.render("aboutus", {
      currentPage: "aboutus",
      user: req.session.user_id,
    });
  } catch (error) {
    next(error);
  }
};

//======================================= to Load the Contact Us Page ====================================================//

const contactLoad = async (req, res, next) => {
  try {
    res.render("contact", {
      currentPage: "contact",
      user: req.session.user_id,
    });
  } catch (error) {
    next(error);
  }
};
//================================== TO SUBMIT REVIEW OF THE USER =======================================================//

const submitReview = async (req, res, next) => {
  try {
    const { productId, rating, comment, userId } = req.body;

    if (rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Invalid rating. Please select a rating between 1 and 5.",
      });
    }

    // Find the product by ID
    console.log("Finding product by ID");
    const product = await Product.findById(productId);

    if (!product) {
      console.log("Product not found");
      return res.json({ success: false, message: "Product not found." });
    }

    // Check if the user with the provided userId exists
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found");
      return res.json({
        success: false,
        message: "User not found, Please Login",
      });
    }

    const existingReview = product.reviews.find(
      (review) => review.user.userId === userId
    );

    if (existingReview) {
      console.log("User has already reviewed the product");
      return res.json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    // Check if the user has a delivered order for the product
    const deliveredOrder = await Order.findOne({
      userId: userId,
      "products.productId": productId,
      "products.OrderStatus": "Delivered",
    });

    if (!deliveredOrder) {
      console.log("User has not purchased the product yet");
      return res.json({
        success: false,
        message: "You can only review or rate a product after receiving it.",
      });
    }

    product.reviews.push({
      user: {
        userId: userId,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      rating,
      comment,
      date: new Date(),
    });

    await product.save();

    res.json({ success: true, message: "Review submitted successfully!" });
  } catch (error) {
    next(error);
  }
};

//===========================edit review =====================================================================//

const editReview = async (req, res, next) => {
  try {
    console.log("Start of edit Review");

    const { reviewId, productId, rating, comment, userId } = req.body;

    if (rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Invalid rating, Please select a valid rating",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      res.json({ success: false, message: "Product Not found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      console.log("User Not found ");
      return res.json({
        success: false,
        message: "User Not found, Please login",
      });
    }

    const existingReviewIndex = product.reviews.findIndex(
      (review) => review._id.toString() === reviewId
    );

    if (existingReviewIndex === -1) {
      return res.json({ success: false, message: "Review Not Found" });
    }

    const existingReview = product.reviews[existingReviewIndex];
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.date = new Date();

    await product.save();

    res.json({ success: true, message: "Review edited succesfully" });
  } catch (error) {
    next(error);
  }
};

//============================== to export the modules ==========================================================//

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
  getProductStock,
  submitReview,
  editReview,
};
