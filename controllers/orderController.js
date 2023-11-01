const User = require("../models/userModel").User;
const Cart = require('../models/userModel').Cart;
const Address= require('../models/userModel').UserAddress;
const Product = require("../models/productsModel").product;
const Order = require('../models/orderModel').Order;
const { log } = require("console");
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
        if(total!=0){
          return res.render('checkout',{
          user:req.session.user_id,
          currentPage:'shop',
          total,
          address:userAddress.addresses,
        })
        }else{
          res.redirect('/cart');
        }
        
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



const daliveryDateCalculate = async () => {
  try {
    // Get the current date
    const currentDate = new Date();
    console.log("Date",currentDate);
    // Add two days to the current date
    const twoDaysLater = new Date(currentDate);
    twoDaysLater.setDate(currentDate.getDate() + 2);

    // Create an array of day names
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Get the day name for the date two days later
    const dayName = dayNames[twoDaysLater.getDay()];

    // Get the formatted date string
    const formattedDate = `${dayName}, ${twoDaysLater.getDate()} ${twoDaysLater.toLocaleString(
      "en-US",
      { month: "long" }
    )} ${twoDaysLater.getFullYear()}`;

    return formattedDate;
  } catch (error) {
    console.log(error.message);
  }
};


const paymenetPageLoad = async (req, res) => {
  try {
    console.log(req.body);
    let addressId = req.body.address;
    let payment =
      req.body.paymentMethod === "COD"
        ? "Cash on Delivery"
        : req.body.paymentMethod;
    console.log(addressId);
    let userAddrs = await Address.findOne({ userId: req.session.user_id });
    const selectedAddress = userAddrs.addresses.find((address) => {
      return address._id.toString() === addressId.toString();
    });
    const cartDetails = await Cart.findOne({ user: req.session.user_id })
      .populate({
        path: "products.product",
        select: "product_name price description category images.image1",
      })
      .exec();
    console.log(cartDetails);
    if (cartDetails) {
      let total = await calculateTotalPrice(req.session.user_id);
      let deliveryDate = await daliveryDateCalculate();
      console.log(deliveryDate);
      res.render("finalcheckout", {
        total,
        currentPage:'shop',
        address: selectedAddress,
        user: req.session.user_id,
        payment,
        cartItems: cartDetails,
        deliveryDate,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};



const paymentSelectionManage = async (req, res) => {
  try {
    console.log(req.body);
    let addressId = req.body.address;
    let payment =
      req.body.paymentMethod === "COD"
        ? "Cash on Delivery"
        : req.body.paymentMethod;
    console.log(addressId);
    let userAddrs = await Address.findOne({ userId: req.session.user_id });
    const selectedAddress = userAddrs.addresses.find((address) => {
      return address._id.toString() === addressId.toString();
    });
    const cartDetails = await Cart.findOne({ user: req.session.user_id })
      .populate({
        path: "products.product",
        select: "product_name price description category images.image1",
      })
      .exec();
    console.log(cartDetails);
    if (cartDetails) {
      let total = await calculateTotalPrice(req.session.user_id);
      let deliveryDate = await daliveryDateCalculate();
      console.log('date:', deliveryDate);
      res.render("finalcheckout", {
        total,
        currentPage:'shop',
        address: selectedAddress,
        user: req.session.user_id,
        payment,
        cartItems: cartDetails,
        deliveryDate:deliveryDate,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const orderStatusPageLoad = async(req,res)=>{
  try {
    console.log('stttttttt');
    res.render('orderStatus',{
      currentPage:'shop',
      success:1,
      user:req.session.user_id,
    })
  } catch (error) {
    console.log(error);
  }
}

const placeOrderManage = async (req, res) => {
  try {
    
   
    let addressId = req.body.address;

    let paymentType = req.body.payment;

    const cartDetails = await Cart.findOne({ user: req.session.user_id });

    let userAddrs = await Address.findOne({ userId: req.session.user_id });
    const shipAddress = userAddrs.addresses.find((address) => {
      return address._id.toString() === addressId.toString();
    });

    
    console.log("collected:", shipAddress);



    if (!shipAddress) {
      return res.status(400).json({ error: "Address not found" });
    }
    // console.log("collected :" + shipAddress);
    const { country, fullName, mobileNumber, pincode, city, state } =
      shipAddress;
    // console.log(state);

    const cartProducts = cartDetails.products.map((productItem) => ({
      productId: productItem.product,
      quantity: productItem.quantity,
      OrderStatus: "pending",
      StatusLevel: 1,
    }));
    let total = await calculateTotalPrice(req.session.user_id);

    // console.log(cartProducts);
    const order = new Order({
      userId: req.session.user_id,
      "shippingAddress.country": country,
      "shippingAddress.fullName": fullName,
      "shippingAddress.mobileNumber": mobileNumber,
      "shippingAddress.pincode": pincode,
      "shippingAddress.city": city,
      "shippingAddress.state": state,
      products: cartProducts,
      totalAmount: total,
      paymentMethod: paymentType,
      paymentStatus: "pending",
    });

    const placeorder = await order.save();
    console.log(placeorder._id);


    if (paymentType !== "Online") {
      console.log(placeorder._id);
      let changeOrderStatus = await Order.updateOne(
        { _id: placeorder._id },
        { $set: { OrderStatus: "success" } }
      );

      await Cart.deleteOne({ user: req.session.user_id });


      return res.json({ cod: true,orderId:placeorder._id });
    } 

  } catch (error) {
    console.log(error.message);
  }
};

const allOrdersPageLoad = async (req,res)=>{
  try {
    res.render('orders',{
      user:req.session.user_id,
      currentPage:'profile',
      
    })
  } catch (error) {
    console.log(error);
  }
}

module.exports={
  checkoutLoad,
  reciveShippingAddress,
  paymenetPageLoad,
  paymentSelectionManage,
  orderStatusPageLoad,
  placeOrderManage,
  
}