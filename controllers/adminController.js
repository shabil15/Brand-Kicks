const admin = require("../models/adminModel");
const user = require("../models/userModel").User;
// const product= require('../models/productsModel').product
const Category = require("../models/productsModel").category;
const bcrypt = require("bcrypt");
const { category } = require("../models/productsModel");


//===================loading the admin Login=====================//


const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

//====================verifying the adminn login=====================================//

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const Password = req.body.password;
    console.log(Password);

    const adminData = await admin.findOne({ email: email });
    console.log(adminData);
    if (adminData) {
      const passwordMatch = await bcrypt.compare(Password, adminData.password);

      if (passwordMatch) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/dashboard");
      } else {
        res.render("login", { message: "Email and  password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email and  password is incorrect" });
    }
  } catch (err) {
    next(err);
  }
};

//============================loading the Dashboard======================//

const dashboardLoad = async (req, res) => {
  try {
    res.render("dashboard");
  } catch (error) {
    console.log(error);
  }
};


//============================loading the Users List Page=======================//

const usersLoad = async (req, res) => {
  try {
    let users = await getAllUserData();
    res.render("users", { users: users });
  } catch (error) {
    console.log(error);
  }
};

//=====================to get the Data of the Users================================//


const getAllUserData = async (req, res) => {
  return new Promise(async (resolve, reject) => {
    let userData = await user.find({});
    resolve(userData);
  });
};

//==============================load the Category Page========================//


const categoryLoad = async (req, res) => {
  try {
    let categories = await getAllCategoriesData();
    res.render("categories", { categories: categories });
  } catch (error) {
    console.log(error);
  }
};


//===========================get All the Categories===============================//

const getAllCategoriesData = async (req, res) => {
  return new Promise(async (resolve, reject) => {
    let categoryData = await Category.find({});
    resolve(categoryData);
  });
};


//==============================load the add category Page===========================//


const addcategoryLoad = async (req, res) => {
  try {
    res.render("addcategories");
  } catch (error) {
    console.log(error);
  }
};

//=============================to add the category ===================//

const addCategory = async (req, res) => {
  try {
    console.log(req.body);
    const id=req.body.id
    const category_name= req.body.category_name
    const already = await Category.findOne({category_name:{$regex:category_name}})
    if(already){
      req.flash('error','The Category Already Exist')
      res.redirect('/admin/categories')

    }else{
    let category = await new Category({
          category_name: req.body.category_name,
          category_description: req.body.category_description,
          is_listed: true,
        });
    let result = await category.save();
    console.log(result);
    if(result){
      req.flash('success','New Category Added');
    res.redirect("/admin/categories");
    }else{
      req.flash('error','something went wrong please try again')
      res.redirect('/admin/categories')
      }
    
    
    }
  } catch (error) {
    console.log(error);
  }
};

//====================to unlist the category=======================//


const unlistCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findById(id);

    if (category) {
      category.is_listed = !category.is_listed;
      await category.save();
    }

    const categories = await Category.find({});
    res.redirect('/admin/categories')
  } catch (error) {
    console.log(error);
  }
};


//===================to block the User==============================//

const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const User = await user.findById(id);
    console.log(User);
    if (User) {
      User.isBlock = !User.isBlock;
      await User.save();
    }

    const users = await user.find({});
    res.redirect('/admin/users')
  } catch (error) {
    console.log(error);
  }
};

//========================load the edit category Page====================//


const editCategoryLoad = async (req, res) => {
  try {
    let categoryDetails = await takeOneUserData(req.query.id);
    console.log(categoryDetails);
    res.render("editCategories", { categories: categoryDetails });
  } catch (error) {
    console.log(error);
  }
};

//==================to take One User data=================================//

const takeOneUserData = async (categoryId) => {
  try {
    let categoryDetails = await Category.find({ _id: categoryId });
    return categoryDetails;
  } catch (error) {
    console.log(error);
  }
};

//===================to Update the category===================================//

const   updateCategoryData = async (req, res) => {
  try {
    let categoryData = req.body;
    let updateCategory = await Category.updateOne(
      { _id: req.query.id },
      {
        $set: {
          category_name: categoryData.category_name,
          category_description: categoryData.category_description,
        },
      }
    );

    console.log(updateCategory);
    req.flash('success','The category Successfully Updated')
    res.redirect("/admin/categories");
  } catch (error) {
    console.log(error);
  }
};


//=========================to admin Logout==============================//

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/admin");
      }
    });
  } catch (error) {
    log(error);
  }
};

module.exports = {
  loadAdminLogin,
  verifyLogin,
  dashboardLoad,
  usersLoad,
  blockUser,
  categoryLoad,
  addcategoryLoad,
  addCategory,
  unlistCategory,
  editCategoryLoad,
  updateCategoryData,
  logout,
};
