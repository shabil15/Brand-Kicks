const admin= require('../models/adminModel')
const user = require ('../models/userModel').User
// const product= require('../models/productsModel').product
const Category=require("../models/productsModel").category
const bcrypt= require('bcrypt')
const session = require("express-session");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};



const verifyLogin = async (req, res,next) => {
  try {
      const email = req.body.email
      const Password = req.body.password
      console.log(Password);

      const adminData = await admin.findOne({ email:email})
      console.log(adminData);
      if (adminData) {

              const passwordMatch = await bcrypt.compare(Password, adminData.password)

              if (passwordMatch) {
                      res.redirect('/admin/dashboard')
              }
              else {
                  res.render('login', { message: "Email and  password is incorrect" })
              }
      }
      else {
          res.render('login', { message: "Email and  password is incorrect" })

      }
  }
  catch (err) {

      next(err)
  }
}


const dashboardLoad= async (req,res)=>{
  try {
    res.render('dashboard')
  } catch (error) {
    log(error)
  }
}


const usersLoad = async (req,res)=>{
  try {
    let users= await getAllUserData() 
    res.render('users',{users:users})
  } catch (error) {
    console.log(error);
  }
}


const getAllUserData = async (req,res)=>{
  return new Promise(async(resolve,reject)=>{
    let userData = await user.find({})
    resolve(userData)
  })
}

const userBlock = async(req,res)=>{
try {
  
  let blockStatus = await user.find({_id:req.body.id})
  console.log(blockStatus.block);
  if(blockStatus.isBlock===false){
    let block = await user.updateOne({_id:req.body.id},{$set:{isBlock:true}})
    console.log(block+ "blocked");
  }else{
    let block = await user.updateOne({_id:req.body.id},{$set:{isBlock:false}})
    console.log(block+ "unblocked");
  }

  let users= await getAllUserData()
  res.json({user:users})


} catch (error) {
 console.log(error); 
}

}



const categoryLoad = async (req,res)=>{
  try {
    let categories= await getAllCategoriesData()
    res.render('categories',{categories:categories})
  } catch (error) {
    console.log(error);
  }
}


const getAllCategoriesData= async (req,res)=>{
  return new Promise(async(resolve,reject)=>{
    let categoryData =await Category.find({})
    resolve(categoryData)
  })

}



const addcategoryLoad = async (req,res)=>{
  try {
    res.render('addcategories')
  } catch (error) {
    console.log(error)
  }
}

const addCategory = async (req,res)=>{
  try {
    console.log(req.body);
    let category =await new  Category({
      category_name:req.body.category_name,
      category_description:req.body.category_description,
      is_listed:true
    })

    let result = await category.save()
    console.log(result);
    res.redirect('/admin/categories')
  } catch (error) {
    console.log(error);
  }
}

const editCategoryLoad = async(req,res)=>{
  try {
    let categoryDetails = await takeOneUserData(req.query.id)
    console.log(categoryDetails);
    res.render('editCategories',{categories:categoryDetails})
  } catch (error) {
  console.log(error);
  }
}


const takeOneUserData = async(categoryId)=>{
  try {
    let categoryDetails= await Category.find({_id:categoryId})
    return categoryDetails
  } catch (error) {
    console.log(error);
  }
}


const updateCategoryData = async (req,res)=>{
  try {
    let categoryData= req.body;
    let updateCategory= await Category.updateOne({_id:req.query.id},{$set:{
          category_name:categoryData.category_name,
          category_description:categoryData.category_description
    }})
    console.log(updateCategory);
    res.redirect('/admin/categories')
  } catch (error) {
    console.log(error);
  }
}



module.exports={
  loadAdminLogin,
  verifyLogin,
  dashboardLoad,
  usersLoad,
  userBlock,
  categoryLoad,
  addcategoryLoad,
  addCategory,
  editCategoryLoad,
  updateCategoryData
}