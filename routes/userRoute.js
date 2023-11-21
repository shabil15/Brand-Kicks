const express = require("express")
const userController = require("../controllers/userController")
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const wishListController =require('../controllers/wishListController')
const couponsController = require('../controllers/couponsController')
const walletController = require('../controllers/walletController')
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
const cartCount =require('../middlewares/cartCount')

user_route.use(cartCount)


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

user_route.post('/updateuser',userAuth.isLogin,userController.updateUserData)

user_route.post('/changepassword',userAuth.isLogin,userController.changePassword)


//===================address related=================================//

user_route.post('/addaddess',userAuth.isLogin,userController.addShippingAddress)

user_route.post('/profile/user_address',userAuth.isLogin,userController.addAddressFromProfile)

user_route.post('/profile/user_address/edit',userAuth.isLogin,userController.updateAddress)

user_route.delete('/profile/user_address/delete',userAuth.isLogin,userController.deleteAddress);

//===============================cart related================================//

user_route.get('/cart',userAuth.isLogin,userController.cartPageLoad)

user_route.post('/addtocart',userAuth.isLogin,userController.addToCart)

user_route.post('/updateCart',userAuth.isLogin,userController.updateCart)

user_route.get('/getProductStock',userController.getProductStock)

user_route.delete('/removecartproduct',userAuth.isLogin,userController.removeCartItem)

//============================== wishList Related ==========================//

user_route.post('/addtoWishList',userAuth.isLogin,wishListController.addtoWishList)

user_route.get('/wishList',userAuth.isLogin,wishListController.wishListPageLoad);

user_route.delete('/removewishitem',userAuth.isLogin,wishListController.removeWishItem)

//==========================order related================================//

user_route.get('/checkout',userAuth.isLogin,orderController.checkoutLoad)

user_route.post('/checkout',userAuth.isLogin,orderController.reciveShippingAddress)

user_route.get('/checkout/paymentselection',userAuth.isLogin,orderController.paymenetPageLoad)

user_route.post('/checkout/paymentselection',userAuth.isLogin,orderController.paymentSelectionManage)

user_route.get('/checkout/placeorder',userAuth.isLogin,orderController.orderStatusPageLoad)

user_route.post('/checkout/placeorder',userAuth.isLogin,orderController.placeOrderManage)

user_route.get('/profile/orders',userAuth.isLogin,orderController.allOrdersPageLoad)

user_route.post('/profile/orders/cancel',userAuth.isLogin,orderController.cancelOrder)

user_route.post('/checkout/verify-payment',userAuth.isLogin,orderController.verifyPayment) 

user_route.get('/checkout/placeorder',userAuth.isLogin,orderController.orderStatusPageLoad)

user_route.post('/checkout/placeorder/verify-payment',userAuth.isLogin,orderController.orderStatusPageLoad)

user_route.get('/checkout/placeorder/amountverify',userAuth.isLogin,orderController.amountVerify)

//======================================== coupon related ================================================//

 user_route.post('/checkout/placeorder/coupon',userAuth.isLogin,couponsController.applyCoupon)


//======================================== user wallet =============================================//

user_route.get('/profile/wallet',userAuth.isLogin,walletController.walletPageLoad)

user_route.post('/profile/addtoWallet',userAuth.isLogin,walletController.addToWallet)

user_route.post('/verifyWalletpayment',userAuth.isLogin,walletController.verifyWalletPayment)


module.exports = user_route 
