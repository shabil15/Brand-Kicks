
const User = require('../models/userModel').User;
const Product = require('../models/productsModel').product;
const Coupon = require('../models/couponModel').Coupon;
const Address= require('../models/userModel').UserAddress;
const Order  = require('../models/orderModel').Order;



const calculateTotalPrice = async (userId) =>{
  try {
   console.log("hi");
  } catch (error) {
    console.log(error);
  }
}

addCouponPageLoad = async (req,res)=>{
  try {
    res.render('addcoupon',{
      codeErr:req.session.couponErr
    },(err,html)=>{
      if(!err){
        req.session.couponErr = false;
        res.send(html);
      }else{
        console.log(err);
      }
    })
  } catch (error) {
    console.log(error);
  }
}


const addcoupon = async (req,res)=>{
  try {
    console.log("reqbody",req.body);
    const {
      code,
      discountAmount,
      activationDate,
      expiryDate,
      description,
      criteriaAmount,
      maxUser,
    }= req.body;

    const couponvalidation = await Coupon.findOne({code:code})
    console.log(couponvalidation);

    if(!couponvalidation){
      const coupon= new Coupon({
        code,
        discountAmount,
        activationDate,
        expiryDate,
        description,
        criteriaAmount,
        maxUser,

      })
      await coupon.save();
      req.session.couponAdded=1
      return res.redirect('/admin/coupon');
    }else {
      return res.redirect('/admin/coupon')
    }
  } catch (error) {
    console.log(error);
  }
}

const couponsPageLoad = async (req,res)=>{
  try {
    const Coupons = await Coupon.find()
    res.render('coupons',{
      Coupons
    })
  } catch (error) {
    console.log(error);
  }
}
module.exports= {
  addCouponPageLoad,
  addcoupon,
  couponsPageLoad,

}