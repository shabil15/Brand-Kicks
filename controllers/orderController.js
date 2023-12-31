const User = require("../models/userModel").User;
const Cart = require('../models/userModel').Cart;
const Address= require('../models/userModel').UserAddress;
const Product = require("../models/productsModel").product;
const Order = require('../models/orderModel').Order;
const Coupon = require('../models/couponModel').Coupon;
const ejs = require("ejs");
const mongoose = require('mongoose');
const { log } = require("console");
const path = require("path");
const Razorpay = require('razorpay');

//================================== razorpay related functions==================================================//

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

const genarateRazorpay = (orderId, total) => {
  return new Promise((resolve, reject) => {
    var options = {
      amount: total * 100, 
      currency: "INR",
      receipt: orderId,
    };
    instance.orders.create(options, function (err, order) {
      resolve(order);
    });
  });
};

//=================================== generate Order Unique Id =============================================//

const generateUniqueTrackId = async () => {
  try {
    let orderID;
    let isUnique = false;

    while (!isUnique) {

      orderID = Math.floor(100000 + Math.random() * 900000);
      const existingOrder = await Order.findOne({ orderID });
   if (!existingOrder) {
        isUnique = true;
      }
    }

    return orderID;
  } catch (error) {
    console.log(error.message);
  }
};

//========================= to Load the Checkout Page ======================================================//

const checkoutLoad = async (req,res,next)=>{
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
    next(error);
  }
}

//===================================== to Calculate the Total Price in cart  ===========================================//

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
      if(product.discountedPrice>0){
        const productSubtotal = Math.floor(product.discountedPrice) *quantity;
        totalPrice +=productSubtotal;
      }else{
        const productSubtotal = product.product_price *quantity;
      totalPrice +=productSubtotal;
      }
    }

    return totalPrice;
  } catch (error) {
    console.log(error);
  }
}


//======================================= to recieve address from the Checkout Page =========================================//


const reciveShippingAddress =async(req,res,next)=>{
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
    next(error);
  }
}

//============================== to calculate the delivery date of the order =======================================//

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


//===================================== to  Load the Payment Page in the Checkout ===================================//

const paymenetPageLoad = async (req, res, next) => {
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
    next(error);
  }
};

//============================================= to select the Payment Methode ==========================================//

const paymentSelectionManage = async (req, res,next) => {
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
    next(error);
  }
};

//===================================== to Load the Order Status Page ==============================================//


const orderStatusPageLoad = async(req,res,next)=>{
  try {
    // console.log('stttttttt');
    // res.render('orderStatus',{
    //   currentPage:'shop',
    //   success:1,
    //   user:req.session.user_id,
    // })
    console.log(req.body);

    if(req.body.status == "success") {
      return res.render("orderStatus",{
        success:1,
        user:req.session.user_id,
        currentPage:'shop',
      })
    }else{
      return res.render('orderStatus',{
        success:0,
        user:req.session.user_id,
        currentPage:'shop',
      })
    }
  } catch (error) {
    next(error);
  }
}


//====================================== function to Place the Order ======================================================//


const placeOrderManage = async (req, res,next) => {
  let discountDetails = {
    codeId: 0,
    amount: 0,
  };
  try {
    
    let addressId = req.body.address;
    
    let paymentType = req.body.payment;
    const userId =req.session.user_id;
    console.log("PAYMENT TYPE: "+paymentType);
    const totalAmount = parseInt(req.body.amount);
    const cartDetails = await Cart.findOne({ user: req.session.user_id });

    let userAddrs = await Address.findOne({ userId: req.session.user_id });
    const shipAddress = userAddrs.addresses.find((address) => {
      return address._id.toString() === addressId.toString();
    });

    // console.log("collected:", shipAddress);

    if (!shipAddress) {
      return res.status(400).json({ error: "Address not found" });
    }

    const user = await User.findById(req.session.user_id );

    if (paymentType === 'wallet' && user.wallet < totalAmount) {
      return res.status(201).json({});
    }
    // console.log("collected :" + shipAddress);
    const { country, fullName, mobileNumber, pincode, city, state } =
      shipAddress;
    // console.log(state);
    const productIDs = cartDetails.products.map(
      (productItem)=> productItem.product
    )

    const productPrices = [];

    const productData = await Cart.find({
      "products.product": {$in : productIDs},
    })
    .populate({
      path:"products.product",
      select:'product_price discountedPrice'
    })
    .exec();

   if(productData && productData.length>0) {
    productData.forEach((order)=> {
      if(order.products && order.products.length>0) {
        order.products.forEach((product)=> {
          const price=
              product.product.discountedPrice || product.product.product_price;
            productPrices.push(price);
        })
      }else {
        console.log("products array is empty in order");
      }
    })
   } else {
    console.log("No matching orders found");
   }
   
    const cartProducts = cartDetails.products.map((productItem,index) => ({
      productId: productItem.product,
      quantity: productItem.quantity,
      OrderStatus: "pending",
      StatusLevel: 1,
      price: productPrices[index],
      paymentStatus: "pending",
      "returnOrderStatus.status": "none",
      "returnOrderStatus.reason": "none",
    }));
    let total = await calculateTotalPrice(req.session.user_id);
    //coupon checking
    // ===================
    
    if (req.body.coupon != "") {
      const couponDetails = await Coupon.findById(req.body.coupon);
      
      total -=couponDetails.discountAmount;
      
      discountDetails.codeId = couponDetails._id;
      
      
      discountDetails.amount = couponDetails.discountAmount;
      
      couponDetails.usedUsers.push(req.session.user_id);
      await couponDetails.save();
    }

    
    const trackId = await generateUniqueTrackId();
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
      coupon: req.body.coupon ? req.body.coupon : "none",
      orderDate: new Date(),
      trackId,
    });
    

    const placeorder = await order.save();
    
    
    if (paymentType == "Cash on Delivery" || paymentType=="wallet") {
      
      if(paymentType== 'wallet'){
        
        let changeOrderStatus = await Order.updateOne(
          { _id: placeorder._id },
          {
            $set: {
              'products.$[].paymentStatus': 'success' ,"products.$[].OrderStatus": "placed"
            },
          }
        );
        const walletHistory = {
          transactionDate: new Date(),
          transactionDetails: 'Product Purchased',
          transactionType: 'Debit',
          transactionAmount: order.totalAmount,
          
         }
         
         await User.findByIdAndUpdate(
          {_id: userId },
          {
              $inc:{
                  wallet: -order.totalAmount
              },
              $push:{
                  walletHistory
              }
          }
      );

      } else {

      

    
    

      let changeOrderStatus = await Order.updateOne(
        { _id: placeorder._id },
        {
          $set: {
            "products.$[].OrderStatus": "placed",
          },
        }
      );
    }
       
      await Cart.deleteOne({ user: req.session.user_id });
     for (const productItem of cartDetails.products) {
        const productId = productItem.product;
        const purchasedQuantity = productItem.quantity;
  

        const product = await Product.findById(productId);
  
        if (product) {
         
          if (product.stock >= purchasedQuantity) {
            
            product.stock -= purchasedQuantity;
  
            await product.save();

          }else{
            console.log("no stock");
            return res.status(400).json({ error: `Insufficient stock for product`});
            
          }
        }
      }
     
      // return res.render("orderStatus", {
      //   success: 1,
      //   user: req.session.user_id
      // });
      return res.json({
        cod: true,
        orderId: placeorder._id,
        status: "success",
      });
    } else if(paymentType === "Online") {
      //here manage when the order is online
      
      let order = await genarateRazorpay(placeorder._id, total);

      let userData = await User.findById(req.session.user_id);

      // payment history create
      for (const productItem of cartDetails.products) {
        const productId = productItem.product;
        const purchasedQuantity = productItem.quantity;
      
      const product = await Product.findById(productId);
  
      if (product) {
       
        if (product.stock >= purchasedQuantity) {
          
          product.stock -= purchasedQuantity;

          await product.save();

        }else{
          console.log("no stock");
          return res.status(400).json({ error: `Insufficient stock for product`});
          
        }
      }
    }
      
      let user = {
        name: fullName,
        mobile: mobileNumber,
        email: userData.email,
      };
      return res.json({ order, user });
      
    }
  } catch (error) {
    next(error);
  }
};
//====================== decrease the stock ======================================================//






//======================== function to formate the Date=====================================================//

function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}
//================================ verify the payment ==================================================================//

const verifyPayment = async (req,res,next)=>{
  try {
    
    const paymentDetails = req.body.payment;
    const cartDetails = await Cart.findOne({ user: req.session.user_id });
    paymentSignatureMatching(paymentDetails)
    .then(async ()=>{
      let changeOrderStatus = await Order.updateOne(
        {_id:req.body.order.receipt},
        {
          $set:{
            "products.$[].OrderStatus": "placed",
          }
        }
      );
      let changePaymentStatus= await Order.updateOne(
        {_id:req.body.order.receipt},
        {
          $set:{
            "products.$[].paymentStatus":"success",
          }
        }
      );
      
      let userCartDelete = await Cart.deleteOne({
        user:req.session.user_id,
      })
      
      for (const productItem of cartDetails.products) {
        const productId = productItem.product;
        const purchasedQuantity = productItem.quantity;
  

        const product = await Product.findById(productId);
  
        if (product) {
         
          if (product.stock >= purchasedQuantity) {
            
            product.stock -= purchasedQuantity;
  
            await product.save();

          }else{
            return res.status(400).json({ error: `Insufficient stock for product: ${product.product_name}` });
          }
        }
      }
      res.json({status:"success"})
    })
    .catch((err)=>{
      res.json({status:"fail"});
    });
  } catch (error) {
    next(error);
  }
}
//================================= payment signature matching ========================================================//

const paymentSignatureMatching = (payment) =>{
  return new Promise((resolve,reject)=>{
    const crypto = require("crypto");
    const webhookSecretKey = process.env.KEY_SECRET;

    const hmac = crypto.createHmac("sha256",webhookSecretKey);
    hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
    const calculatedHmac = hmac.digest("hex");

    if(calculatedHmac === payment.razorpay_signature){
      resolve()
    }else{
      console.log("Invalid payment Signature");
    }
  })
}

//============================== to Load the All Orders Page Load on the user Side ====================================//

const allOrdersPageLoad = async (req,res,next)=>{
  try {

    const userId = req.session.user_id;

    const userOrders = await Order.find({userId:userId});

    if(userOrders.length ===0){
      
      return res.render('orders',{
        user:userId,
        products:false,
        currentPage:"profile"
      })
    }

    const productWiseOrders = []
    
  

    for(const order of userOrders){
      for(const product of order.products) {
        const productId = product.productId;
        const quantity = product.quantity;
        const placeDate = formatDate(order.orderDate);
        const OrderStatus = product.OrderStatus;
        const StatusLevel = product.StatusLevel;
        const price = product.price;
        
        


        const productDetails = await Product.findById(productId,{
          images:1,
          product_name:1,
          category:1,
          product_price:1,
        })

        let deliveryDate = await daliveryDateCalculate(order.orderDate);

        const productWiseOrder = {
          orderId:order._id,
          totalAmount: order.totalAmount,
          placeOrderDate:placeDate,
          paymentMethod:order.paymentMethod,
          productDetails,
          price,
          quantity,
          address:order.shippingAddress,
          deliveryDate:deliveryDate,
          OrderStatus,
          StatusLevel
        }

        productWiseOrders.push(productWiseOrder)

      }
    }


    res.render('orders',{
      user:req.session.user_id,
      products:productWiseOrders,
      currentPage:'profile',
    })

  
  } catch (error) {
    next(error);
  }
}


//=============================== to cancel the order from the admin and user ===================================//

const cancelOrder = async (req, res,next) => {
  try {
    const { orderId, productId } = req.body;
    

    const order = await Order.findById(orderId);
    

    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ message: "Order not found" });
    }

    

    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    const user = order.userId
    const total = Math.floor(productInfo.price)* productInfo.quantity;

    if (!productInfo) {
      
      return res.status(404).json({ message: "Product not found in the order" });
    }

    

    productInfo.OrderStatus = "canceled";
    

    const quantityToIncrease = productInfo.quantity;

    const product = await Product.findById(productId);

    if (!product) {
      
      return res.status(404).json({ message: "Product not found in the database" });
    }

    

    product.stock += quantityToIncrease;
    

    await product.save();
    

    //========= wallet money= ==================//
    if(productInfo.paymentStatus==='success'){
      const totalAmount = total
      const walletHistory = {
        transactionDate: new Date(),
        transactionDetails: 'Refund',
        transactionType: 'Credit',
        transactionAmount: totalAmount,
         currentBalance: !isNaN(user.wallet) ? user.wallet + amount : totalAmount
       }
        await User.findByIdAndUpdate(
            {_id: user },
            {
                $inc:{
                    wallet: totalAmount
                },
                $push:{
                    walletHistory
                }
            }
        );
        productInfo.paymentStatus = 'refund';
      }      

      
    await order.save();
    

    res.json({ cancel: 1 });
    
  } catch (error) {
    next(error);
  }
};


//=================orders list page load in admin side==========================//


const ordersListPageLoad = async (req,res,next)=>{
  try {
    
    const orders = await Order.find({})

    const productWiseOrdersArray = [];

    for(const order of orders){
      for(productInfo of order.products) {
        const productId = productInfo.productId;

        const product = await Product.findById(productId).select(
          "product_name product_price images"
        )
        const userDetails = await User.findById(order.userId).select(
          "firstName secondName"
        );

        if(product) {
          orderDate = await formatDate(order.orderDate);
          productWiseOrdersArray.push({
            user:userDetails,
            product:product,
            orderDetails: {
              _id: order._id,
              userId: order.userId,
              shippingAddress:order.shippingAddress,
              orderDate:orderDate,
              totalAmount: Math.floor(productInfo.price)* productInfo.quantity,
              OrderStatus:productInfo.OrderStatus,
              StatusLevel:productInfo.StatusLevel,
              paymentMethod:order.paymentMethod,
              paymentStatus:productInfo.paymentStatus,
              quantity:productInfo.quantity,
            }
          })
        }
      } 
    }


    res.render('orders',{
      orders:productWiseOrdersArray
    })


  } catch (error) {
    next(error);
  }
}

//==============order management page Load  in admin side=========================//

const orderManagePageLoad = async (req, res,next) => {
  try {
    const { orderId, productId } = req.query;

   

    const order = await Order.findById(orderId);

    if (!order) {
      
      return res.status(404).sendFile(path.dirname(__dirname, 'views', '404.html'));
    }

    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );

  

    const product = await Product.findById(productId).select('product_name images ');

    let orderDate = formatDate(order.orderDate);

    const productOrder = {
      orderId: order._id,
      product: product,
      orderDetails: {
        _id: order._id,
        userId: order.userId,
        shippingAddress: order.shippingAddress,
        orderDate,
        totalAmount: order.totalAmount,
        orderStatus: productInfo.OrderStatus,
        StatusLevel: productInfo.StatusLevel,
        paymentMethod: order.paymentMethod,
        paymentStatus: productInfo.paymentStatus,
        quantity: productInfo.quantity,
      },
    };

    res.render('orderManagement', {
      product: productOrder,
      orderId,
      productId,
    });
  } catch (error) {
    next(error);
  }
}

//================================================= to change the Order Status from Admin ================================================//


const changeOrderStatus = async (req, res,next)=>{
  try {
    const { status,orderId,productId} =req.body;
    const order = await Order.findById(orderId)

    const statusMap = {
      Shipped:2,
      OutforDelivery:3,
      Delivered:4,
    }

    const selectedStatus = status;
    const StatusLevel= statusMap[selectedStatus];


    if(!order) {
      return res.status(404).json({message: "Order not found."})
    }

    
    const productInfo = order.products.find(
    (product) => product.productId.toString()===productId
    );

    productInfo.OrderStatus = status;
    productInfo.StatusLevel = StatusLevel;

    if (StatusLevel === 4) {
      
      productInfo.paymentStatus = "success";
    }

    const result = await order.save();

    res.redirect(
      `/admin/orders/manage?orderId=${orderId}&productId=${productId}`
    )
  } catch (error) {
    next(error);
  }
}

//================ to verify the total amount when applying coupon ============================================//

  const amountVerify = async(req,res,next)=>{
    try {
      const total = await calculateTotalPrice(req.session.user_id);
      res.json(total);
    } catch (error) {
      next(error);
    }
  } 

  //====================================== to download Order Invoice ============================================//

  const invoiceDownload = async (req, res, next) => {
    try {
      const orderId = req.query.id;
      const productName = req.query.productName;
      
      
      
      const orderData = await Order.findById(orderId)
      .populate("userId")
      
      
      if (!orderData) {
        return res.status(404).send("Order not found");
      }
  
      const userId = req.session.user_id;
      const userData = await User.findById(userId);
  
      const date = new Date();
      const data = {
        orderData: orderData,
        userData: userData,
        
        date,
      };
  
      res.render('invoice',{orderData,userData,productName,date})
    } catch (error) {
      
      next(error);
    }
  };
  
  

module.exports={
  checkoutLoad,
  reciveShippingAddress,
  paymenetPageLoad,
  paymentSelectionManage,
  orderStatusPageLoad,
  placeOrderManage,
  verifyPayment,
  allOrdersPageLoad,
  cancelOrder,
  ordersListPageLoad,
  orderManagePageLoad,
  changeOrderStatus,
  amountVerify,
  invoiceDownload,
}