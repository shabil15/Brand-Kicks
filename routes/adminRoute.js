
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
admin_route.get('/',adminController.dashboardLoad)
module.exports=admin_route