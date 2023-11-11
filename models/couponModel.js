const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type:String,
    required:true,
    unique:true,
  },
  discountAmount :{
    type: Number,
    required:true,
  },
  activationDate:{
    type:Date,
    required:true,
  },
  expiryDate:{
    type: Date ,
    required : true,
  },
  description:{
    type:String,
    require: true
  },
  criteriaAmount:{
    type: Number,
    required:true
  },
  maxUser:{
    type:Number,
    required:true
  },
  usedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ]
})

const Coupon = mongoose.model('Coupon',couponSchema);

module.exports ={
  Coupon
}