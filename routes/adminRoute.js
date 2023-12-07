
const express = require('express')
const admin_route =express()
const multer= require('multer')
admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin') 
const adminAuth = require('../middlewares/admin')

const errorHandler = require('../middlewares/errorHandler')
admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}));


const adminController =require('../controllers/adminController')
const productController = require('../controllers/productController')
const fileUpload= require('../middlewares/fileUpload')
const bannerController= require('../controllers/bannersController')
const orderController =require('../controllers/orderController')
const couponController = require('../controllers/couponsController');
const reportController = require('../controllers/reportController')
const offerController = require('../controllers/offerController')

//=============================== authentication ============================================//

admin_route.get('/',adminAuth.isLogout,adminController.loadAdminLogin)
admin_route.post('/',adminAuth.isLogout,adminController.verifyLogin)
admin_route.get('/logout',adminController.logout)


admin_route.get('/dashboard',adminAuth.isLogin,adminController.dashboardLoad)

//=============================== user related ============================================//

admin_route.get('/users',adminAuth.isLogin,adminController.usersLoad)
admin_route.get('/blockUser',adminAuth.isLogin,adminController.blockUser)
admin_route.get('/searchUsers',adminAuth.isLogin,adminController.searchUsers)

//==================================== Product Related =================================//

admin_route.get('/addproduct',adminAuth.isLogin,productController.addProductLoad)
admin_route.post('/addproduct',adminAuth.isLogin,fileUpload.productImagesUpload,productController.addProduct)
admin_route.get('/editproduct',adminAuth.isLogin,productController.editProductLoad)
admin_route.post('/editproduct',adminAuth.isLogin,fileUpload.productImagesUpload,productController.editProduct)
admin_route.get('/products',adminAuth.isLogin,productController.productsLoad)
admin_route.get('/unlistProduct',adminAuth.isLogin,productController.unlistProduct)
admin_route.get('/search_product',adminAuth.isLogin,productController.searchProducts)

//===================================== category related ========================================//

admin_route.get('/categories',adminAuth.isLogin,adminController.categoryLoad)
admin_route.get('/addCategory',adminAuth.isLogin,adminController.addcategoryLoad)
admin_route.post('/addCategory',adminAuth.isLogin,adminController.addCategory)
admin_route.get('/unlistCategory',adminAuth.isLogin,adminController.unlistCategory)
admin_route.get('/editCategory',adminAuth.isLogin,adminController.editCategoryLoad)
admin_route.post('/editCategory',adminAuth.isLogin,adminController.updateCategoryData)

//===================================== banners related =========================================//

admin_route.get('/banners',adminAuth.isLogin,bannerController.bannersLoad)
admin_route.get('/addbanner',adminAuth.isLogin,bannerController.addbannersLoad)
admin_route.post('/addbanner',adminAuth.isLogin,fileUpload.uploadBanner.single('banner'),bannerController.addBanner)
admin_route.get('/deletebanner',adminAuth.isLogin,bannerController.deletebanner)
admin_route.get('/visible',adminAuth.isLogin,bannerController.visibilityBanner);


//==============================  Orders Related ===================================================//

admin_route.get('/orders',adminAuth.isLogin,orderController.ordersListPageLoad)
admin_route.get('/orders/manage',adminAuth.isLogin,orderController.orderManagePageLoad);
admin_route.post('/orders/manage/changestatus',adminAuth.isLogin,orderController.changeOrderStatus)
admin_route.post('/orders/manage/cancel',adminAuth.isLogin,orderController.cancelOrder);


//====================================== coupon related ================================================//

admin_route.get('/addcoupon',adminAuth.isLogin,couponController.addCouponPageLoad);
admin_route.post('/addcoupon',adminAuth.isLogin,couponController.addcoupon);
admin_route.get('/coupons',adminAuth.isLogin,couponController.couponsPageLoad)
admin_route.get('/coupon/edit',adminAuth.isLogin,couponController.editCouponPageLoad)
admin_route.post('/coupon/edit',adminAuth.isLogin,couponController.editCoupon)
admin_route.get('/coupon/delete',adminAuth.isLogin,couponController.deleteCoupon);


//============================= dashboard related =============================================//

admin_route.post('/report/genarate',adminAuth.isLogin,adminController.genarateSalesReports);
admin_route.get('/report',adminAuth.isLogin,reportController.loadSalesReport);
admin_route.post('/sales-report/portfolio',adminAuth.isLogin,reportController.portfolioFiltering);
admin_route.get('/report/export-report',adminAuth.isLogin,reportController.generateExcelReport);


//================== offer Related =============================================================//

admin_route.get('/addOffer',adminAuth.isLogin,offerController.loadAddOffer)
admin_route.post('/addOffer',adminAuth.isLogin,offerController.addOffer)
admin_route.get('/offers',adminAuth.isLogin,offerController.loadOffers);
admin_route.get('/editOffer/:id',adminAuth.isLogin,offerController.loadEditOffer)
admin_route.post('/editOffer/',adminAuth.isLogin,offerController.editOffer)
admin_route.patch('/cancelOffer',adminAuth.isLogin,offerController.cancelOffer);
admin_route.patch('/applyOffer',adminAuth.isLogin,productController.applyProductOffer);
admin_route.patch('/removeOffer',adminAuth.isLogin,productController.removeProductOffer);
admin_route.patch('/applyOffer_category',adminAuth.isLogin,adminController.applyCategoryOffer);
admin_route.patch('/removeOffer_category',adminAuth.isLogin,adminController.removeCategoryOffer);

admin_route.use(errorHandler)

admin_route.get('*', (req, res) => {
  console.log(req.url)
  res.render('404');
});

module.exports=admin_route