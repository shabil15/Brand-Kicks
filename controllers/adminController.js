const admin = require("../models/adminModel");
const user = require("../models/userModel").User;
const Category = require("../models/productsModel").category;
const Product = require('../models/productsModel').product
const Order = require('../models/orderModel').Order
const bcrypt = require("bcrypt");
const { category } = require("../models/productsModel");


//===================loading the admin Login==========================================================//


const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

//====================verifying the adminn login==========================================================//

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const Password = req.body.password;
    

    const adminData = await admin.findOne({ email: email });
    if (adminData) {
      const passwordMatch = await bcrypt.compare(Password, adminData.password);

      if (passwordMatch) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/dashboard");
      } else {
        res.render("adminLogin", { message: "Email and  password is incorrect" });
      }
    } else {
      res.render("adminLogin", { message: "Email and  password is incorrect" });
    }
  } catch (err) {
    next(err);
  }
};

//============================loading the Dashboard===============================================================//

const dashboardLoad = async (req, res) => {
  try {

    let users = await user.find({});

    const TransactionHistory = await Order.find()
    .sort({ orderDate: -1 })
    .limit(10);

    const countOfCod  = await Order.countDocuments({
      paymentMethod :"Cash on Delivery",
    })

    const countOfOnline = await Order.countDocuments({
      paymentMethod:'Online'
    }) 

    const countOfWallet = await Order.countDocuments({
      paymentMethod :'wallet'
    })

    const paymentChart = { countOfCod,countOfOnline,countOfWallet};

    const orders = await recentOrder();

    const result = await createSalesReport("year")

    const report ={
      totalSalesAmount:result.totalSalesAmount,
      sales: result.totalProductsSold,
      amount :result.profit,
    }

    res.render("dashboard",{
      users:users,
      paymentHistory:TransactionHistory,
      orders,
      paymentChart,
      report
    })
  } catch (error) {
    console.log(error);
  }
};


//================== finding the recent order ==============================================//

const recentOrder = async () =>{
  try {
    const orders = await Order.find()
    .sort({ orderDate: -1 })
    .limit(10);

    const productWiseOrdersArray = [];

    for (const order of orders) {
      for (const productInfo of order.products) {
        const productId = productInfo.productId;

        const product = await Product.findById(productId).select(
          "product_name images product_price"
        );

        const userDetails = await user.findById(order.userId).select(
          "email firstName"
        );
        
        if(product) {
          orderDate = await formatDate(order.orderDate );
          productWiseOrdersArray.push({
            user:userDetails,
            product:product,
            orderDetails:{
              _id: order._id,
              userId : order.userId,
              shippingAddress:order.shippingAddress,
              orderDate:orderDate,
              totalAmount :productInfo.quantity * product.product_price,
              OrderStatus : productInfo.OrderStatus,
              StatusLevel:productInfo.StatusLevel,
              paymentMethod:order.paymentMethod,
              paymentStatus:productInfo.paymentStatus,
              quantity:productInfo.quantity
            }
          })
        }
      }
    }
    return productWiseOrdersArray.slice(0,10);
  } catch (error) {
    console.log(error);
  }
}

//========================== generating sales Report ==============================================//

const genarateSalesReports = async (req, res) => {
  try {
    const date = Date.now();    
    
    const result = await createSalesReport(req.body.data)
    const report = {
        reportDate: date,
        totalSalesAmount: result.totalSalesAmount,
        totalOrders: result.totalProductsSold,
        totalProfit:result.profit
      };

    
    res.status(200).json({report});
    
  } catch (error) {
    console.log(error.message);
  }
};



//=============================== creating Sales Report ======================================================//

const createSalesReport = async (interval) => {
  try {
    let startDate, endDate;

    if (interval === "day") {
      const today = new Date();
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0); // Start of the day
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999); // End of the day
    } else {
      startDate = getStartDate(interval);
      endDate = getEndDate(interval);
    }



    const orderDataData = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: { "products.paymentStatus": "success" },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'populatedProduct',
        },
      },
      {
        $unwind: '$populatedProduct',
      },
      {
        $group: {
          _id: '$populatedProduct._id',
          productName: { $first: '$populatedProduct.productName' },
          totalSalesAmount: {
            $sum: { $multiply: [{$toDouble: '$populatedProduct.product_price'}, '$products.quantity'] },
          },
          totalProductsSold: { $sum: '$products.quantity' },
        },
      },
      {
        $group: {
          _id: null,
          totalSalesAmount: { $sum: '$totalSalesAmount' },
          totalProductsSold: { $sum: '$totalProductsSold' },
        },
      },
    ]);
    
    // Extracting totals directly from the first result, as it's now a single document
    const { totalSalesAmount, totalProductsSold } = orderDataData[0];

    const profit =Math.floor(totalSalesAmount*0.3) 

const salesReport = {
  profit,
  totalSalesAmount,
  totalProductsSold
};


    return salesReport;
  } catch (error) {
    console.error("Error generating the sales report:", error.message);
  }
};

//============================= this function used to formate date from new Date() function ============================//

function formatDate(date) {
  const options = {
    weekday:'long',
    year:'numeric',
    month:'long',
    day:'numeric',
  }

  return date.toLocaleDateString("en-US",options);
}

//======================== setting start Date and end  date ================================//

const getStartDate = (interval) => {
  const start = new Date();
  if(interval === "week") {
    start.setDate(start.getDate() -start.getDay());
  }else if(interval ==='year') {
    start.setMonth(0,1);
  }
  return start ;
}


const getEndDate = (interval) =>{
  const end = new Date();
  if(interval ==='week') {
    end.setDate(end.getDate()-end.getDay() + 6);
  } else if (interval ==='year') {
    end.setMonth(11,31)
  }

  return end;
}

//============================loading the Users List Page==========================================================//

const usersLoad = async (req, res) => {
  try {
    let users = await getAllUserData();
    res.render("users", { users: users });
  } catch (error) {
    console.log(error);
  }
};

//=====================to get the Data of the Users=================================================================//


const getAllUserData = async (req, res) => {
  return new Promise(async (resolve, reject) => {
    let userData = await user.find({});
    resolve(userData);
  });
};

//==============================load the Category Page=============================================================//


const categoryLoad = async (req, res) => {
  try {
    let categories = await getAllCategoriesData();
    res.render("categories", { categories: categories });
  } catch (error) {
    console.log(error);
  }
};


//===========================get All the Categories====================================================================//

const getAllCategoriesData = async (req, res) => {
  return new Promise(async (resolve, reject) => {
    let categoryData = await Category.find({});
    resolve(categoryData);
  });
};


//==============================load the add category Page===============================================================//


const addcategoryLoad = async (req, res) => {
  try {
    res.render("addcategories");
  } catch (error) {
    console.log(error);
  }
};

//=============================to add the category ===================================================================//

const addCategory = async (req, res) => {
  try {
    console.log(req.body);
    const id=req.body.id
    const category_name= req.body.category_name
    const already = await Category.findOne({category_name:{$regex:category_name}})
    if(already){
      req.flash('error','The Category Already Exist')
      res.redirect('/admin/addCategory')

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
      res.redirect('/admin/addCategory')
      }
    
    
    }
  } catch (error) {
    console.log(error);
  }
};

//====================to unlist the category=========================================================================//


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


//===================to block the User==================================================================================//

const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const User = await user.findById(id);
    console.log(User);
    if (User) {

      User.isBlock = !User.isBlock;
      await User.save();

      if(req.session.user_id===id){
        req.session.user_id=null;
      }
    }

    const users = await user.find({});
    res.redirect('/admin/users')
  } catch (error) {
    console.log(error);
  }
};

//=========================search Users===============================================================================//

const searchUsers = async (req, res) => {
  const query = req.query.query; // Get the search query from the request

  // Perform a search query to filter users by name, email, and mobile number
  const users = await user.find({
      $or: [
          { firstName: { $regex: query, $options: 'i' } }, // Case-insensitive search for first name
          { secondName: { $regex: query, $options: 'i' } }, // Case-insensitive search for second name
          { email: { $regex: query, $options: 'i' } }, // Case-insensitive search for email
          { mobile: { $regex: query, $options: 'i' } } // Case-insensitive search for mobile number
      ]
  });

  res.render('users', { users: users });
};



//========================load the edit category Page====================================================================//


const editCategoryLoad = async (req, res) => {
  try {
    let categoryDetails = await takeOneUserData(req.query.id);
    console.log(categoryDetails);
    res.render("editCategories", { categories: categoryDetails });
  } catch (error) {
    console.log(error);
  }
};

//==================to take One User data===================================================================================//

const takeOneUserData = async (categoryId) => {
  try {
    let categoryDetails = await Category.find({ _id: categoryId });
    return categoryDetails;
  } catch (error) {
    console.log(error);
  }
};



const updateCategoryData = async (req, res) => {
  try {
    const categoryData = req.body;
    const categoryId = req.query.id;

    // Check if there's an existing category with the same name
    const existingCategory = await Category.findOne({
      category_name: categoryData.category_name,
      _id: { $ne: categoryId }, // Exclude the current category being updated
    });

    if (existingCategory) {
      req.flash('error', 'A category with this name already exists');
      res.redirect('/admin/categories');
    } else {
      // Update the category
      const updateCategory = await Category.updateOne(
        { _id: categoryId },
        {
          $set: {
            category_name: categoryData.category_name,
            category_description: categoryData.category_description,
          },
        }
      );

      if (updateCategory) {
        req.flash('success', 'The category was successfully updated');
        res.redirect('/admin/categories');
      } else {
        req.flash('error', 'No changes were made to the category');
        res.redirect('/admin/categories');
      }

      
    }
  } catch (error) {
    console.log(error);
  }
};


//=========================to admin Logout==============================================================================//

const logout = async (req, res) => {
  try {
    req.session.admin_id=null;
    res.redirect('/admin')
  } catch (error) {
    log(error);
  }
};

module.exports = {
  loadAdminLogin,
  verifyLogin,
  dashboardLoad,
  genarateSalesReports,
  usersLoad,
  blockUser,
  searchUsers,
  categoryLoad,
  addcategoryLoad,
  addCategory,
  unlistCategory,
  editCategoryLoad,
  updateCategoryData,
  logout,
};
