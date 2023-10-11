
const express = require('express')
const admin_route =express()
const config=require('../config/config')
const session = require('express-session')



admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin') 


admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}));


const adminController =require('../controllers/adminController')

admin_route.get('/',adminController.loadAdminLogin)
admin_route.post('/',adminController.verifyLogin)
admin_route.get('/dashboard',adminController.dashboardLoad)
admin_route.get('/users',adminController.usersLoad)
admin_route.post('/blockUser',adminController.userBlock)


admin_route.get('/categories',adminController.categoryLoad)
admin_route.get('/addCategory',adminController.addcategoryLoad)
admin_route.post('/addCategory',adminController.addCategory)
admin_route.get('/editCategory',adminController.editCategoryLoad)
admin_route.post('/editCategory',adminController.updateCategoryData)

module.exports=admin_route