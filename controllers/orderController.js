const User = require("../models/userModel").User;
const Cart = require('../models/userModel').Cart;
const Address= require('../models/userModel').UserAddress;
const Product = require("../models/productsModel").product;
const path = require("path");


const checkoutLoad = async (req,res)=>{
  try {
    const cartDetails = await Cart.findOne({ user:req.session.user_id})
    .populate({
      path:'products.product',
      select:'product_name',
    })
    .exec();

    if(cartDetails){
      let total = await calculateTotalPrice(req.session.user_id);
      let userAddress = await Address.findOne(
        {userId:req.session.user_id},
        {addresses:1}
      );

      if(userAddress){
        return res.render('checkout',{
          user:req.session.user_id,
          currentPage:'shop',
          total,
          address:userAddress.addresses,
        })
      }else{
        res.render('checkout',{
          user:req.session.user_id,
          currentPage:'shop',
          total,
          address:0,
        })
      }
    } else{
      return res.redirect('/cart')
    }
  } catch (error) {
    console.log(error);
  }
}

const calculateTotalPrice= async (userId) =>{
  try {
    const cart=await Cart.findOne({user:userId}).populate(
      "products.product"
    );
    if(!cart){
      console.log("User does not have a cart");
    }

    let totalPrice = 0;
    for(const cartProduct of cart.products) {
      const {product,quantity }=cartProduct;
      const productSubtotal = product.product_price *quantity;
      totalPrice +=productSubtotal;
    }

    return totalPrice;
  } catch (error) {
    console.log(error);
  }
}

const paymentSelection =async (req,res)=>{
  try {
    res.render('paymentSelect')
  } catch (error) {
    console.log(error);
  }
}

const reciveShippingAddress =async(req,res)=>{
  try {
    const userAddress = await Address.findOne({ userId: req.session.user_id})

    if(userAddress) {
      const selectedAddress = await userAddress.addresses.find((address) =>{
        return address._id.toString()=== req.body.address.toString();
      })

      if(selectedAddress) {
        let total = await calculateTotalPrice(req.session.user_id);
        return res.render('paymentSelect',{
          user:req.session.user_id,
          currentPage:'shop',
          address:selectedAddress,
          total,
        })
      }else{
        console.log("specific address not found");
        res.render('404');
      }
    }else{
      console.log("User address document not found");
      res.rendor('404');
    }
    
    
  } catch (error) {
    console.log(error);
  }
}
module.exports={
  checkoutLoad,
  paymentSelection,
  reciveShippingAddress,
  
}