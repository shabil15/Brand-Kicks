const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true,
  },
  shippingAddress: {
    country: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    }
  },
  products:[
    {
      productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true,
      },
      price:{
        type:Number,
        required:true
      },
      quantity:{
        type: Number,
        required:true,
      },
      OrderStatus:{
        type:String,
        required:true
      },
      StatusLevel:{
        type: Number,
        required: true
      },
      paymentStatus:{
        type:String,
        require:true
      },
      returnOrderStatus:{
        status:{
          type:String
        },
        reason:{
          type:String
        }
      },
      updatedAt:{
        type:Date,
        default:Date.now
      }

    }
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod:{
    type:String,
    require:true
  },
  coupon:{
    type:String,
    require:true,
  },
  trackId:{
    type:Number,
    require:true
  }
})


const Order = mongoose.model('Order',orderSchema)


module.exports={
  Order
}