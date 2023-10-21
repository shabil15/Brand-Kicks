const express = require("express")
const userController = require("../controllers/userController")
const productController = require('../controllers/productController')
const session = require("express-session")

const config = require("../config/config")

const path = require("path")

const user_route = express()

user_route.set('view engine','ejs')
user_route.set('views','./views/users')

user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))

// user_route.use(session({
//     secret:config.sessionSecret,
//     resave:false,
//     saveUninitialized:true
// }))



user_route.get('/signup',userController.loadRegister)
user_route.post('/signup',userController.insertUser)


user_route.get('/',userController.loadHome)

user_route.get('/login',userController.loginLoad)

user_route.get('/submit-otp', userController.showverifyOTPPage)

user_route.post('/submit-otp', userController.verifyOTP)

user_route.get('/resend-otp', userController.resendOTP) 

user_route.post('/login',userController.verifyLogin)

user_route.get('/forget',userController.forgetLoad)
  
user_route.post('/forget',userController.forgetVerify)

user_route.get('/forget-password',userController.forgetPasswordLoad)

user_route.post('/forget-password',userController.resetPassword)

user_route.get('/logout',userController.logout)

//===================== products related==========================//

user_route.get('/shop',userController.loadShop)

user_route.get('/product',productController.productPageLoad);

user_route.get('/aboutus',userController.aboutusLoad)


//========================profile related===============================//

user_route.get('/profile',userController.profilePageLoad)


module.exports = user_route 
