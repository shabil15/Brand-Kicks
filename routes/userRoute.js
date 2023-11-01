const express = require("express")
const userController = require("../controllers/userController")
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const session = require("express-session")

const config = require("../config/config")

const path = require("path")

const user_route = express()

user_route.set('view engine','ejs')
user_route.set('views','./views/users')

user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))

const userAuth =require('../middlewares/user')

// user_route.use(session({
//     secret:config.sessionSecret,
//     resave:false,
//     saveUninitialized:true
// }))



user_route.get('/signup',userController.loadRegister)
user_route.post('/signup',userController.insertUser)


user_route.get('/',userController.loadHome)

user_route.get('/aboutus',userController.aboutusLoad)

user_route.get('/contact',userController.contactLoad)

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




//========================profile related===============================//

user_route.get('/profile',userAuth.isLogin,userController.profilePageLoad)

user_route.post('/updateuser',userController.updateUserData)

user_route.post('/changepassword',userController.changePassword)


//===================address related=================================//

user_route.post('/addaddess',userController.addShippingAddress)

user_route.post('/profile/user_address',userController.addAddressFromProfile)

user_route.post('/profile/user_address/edit',userController.updateAddress)

user_route.delete('/updateCart',userController.updateCart);

//===============================cart related================================//

user_route.get('/cart',userController.cartPageLoad)

user_route.post('/addtocart',userController.addToCart)

user_route.post('/updateCart',userController.updateCart)

user_route.delete('/removecartproduct',userController.removeCartItem)


//==========================order related================================//

user_route.get('/checkout',orderController.checkoutLoad)

user_route.post('/checkout',orderController.reciveShippingAddress)

user_route.post('/checkout/paymentselection',orderController.paymentSelectionManage)










module.exports = user_route 
