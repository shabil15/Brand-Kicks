
const express = require('express')
const admin_route =express()
const multer= require('multer')
admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin') 
const adminAuth = require('../middlewares/admin')


admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}));


const adminController =require('../controllers/adminController')
const productController = require('../controllers/productController')
const fileUpload= require('../middlewares/fileUpload')
const bannerController= require('../controllers/bannersController')

admin_route.get('/',adminAuth.isLogout,adminController.loadAdminLogin)
admin_route.post('/',adminAuth.isLogout,adminController.verifyLogin)
admin_route.get('/logout',adminController.logout)

admin_route.get('/dashboard',adminAuth.isLogin,adminController.dashboardLoad)
admin_route.get('/users',adminAuth.isLogin,adminController.usersLoad)
admin_route.get('/blockUser',adminAuth.isLogin,adminController.blockUser)



admin_route.get('/addproduct',adminAuth.isLogin,productController.addProductLoad)
admin_route.post('/addproduct',adminAuth.isLogin,fileUpload.productImagesUpload,productController.addProduct)
admin_route.get('/editproduct',adminAuth.isLogin,productController.editProductLoad)
admin_route.post('/editproduct',adminAuth.isLogin,fileUpload.productImagesUpload,productController.editProduct)
admin_route.get('/products',adminAuth.isLogin,productController.productsLoad)
admin_route.get('/unlistProduct',adminAuth.isLogin,productController.unlistProduct)


admin_route.get('/categories',adminAuth.isLogin,adminController.categoryLoad)
admin_route.get('/addCategory',adminAuth.isLogin,adminController.addcategoryLoad)
admin_route.post('/addCategory',adminAuth.isLogin,adminController.addCategory)
admin_route.get('/unlistCategory',adminAuth.isLogin,adminController.unlistCategory)
admin_route.get('/editCategory',adminAuth.isLogin,adminController.editCategoryLoad)
admin_route.post('/editCategory',adminAuth.isLogin,adminController.updateCategoryData)

admin_route.get('/banners',adminAuth.isLogin,bannerController.bannersLoad)
admin_route.get('/addbanner',adminAuth.isLogin,bannerController.addbannersLoad)
admin_route.post('/addbanner',adminAuth.isLogin,fileUpload.uploadBanner.single('banner'),bannerController.addBanner)
admin_route.get('/deletebanner',adminAuth.isLogin,bannerController.deleteBanner)
admin_route.get('/visible',adminAuth.isLogin,bannerController.visibilityBanner);

module.exports=admin_route