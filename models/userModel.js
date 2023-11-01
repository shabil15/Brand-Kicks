const mongoose = require('mongoose');

// const { Schema, ObjectId } = mongoose;

const UserSchema = new mongoose.Schema({
 
  firstName: {
     type: String,
     required: true 
    },
  secondName: { 
    type: String,
    required:true 
    },
  email: { 
    type: String, 
    required: true 
  }, 
  mobile:{
     type: String, 
     required: true 
    },
  password: { 
    type: String, 
    required: true 
  },
  isVerified: {
    type: Boolean,
    default: 0
},
isBlock:{
    type: Boolean,
    default: false
},
token:{
  type:String,
  default:''
},
address:{
  shippingAddress:{
    type:String,
  },
  pincode:{
    type:Number
  },
  state:{
    type:String
  }

},
avatar:{
  type:String
}
},
{
  timestamps:true
}
);

const cartSchema = new mongoose.Schema({
  user: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  products:[
    {
      product: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'product',
        required: true
      },
      quantity : {
        type: Number,
        default:1,
        min:1,
        max:10,
      }
    }
  ]
},
{
  timestamps:true
})


const userAddressSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  addresses: [

  {
    country : {
      type: String,
      required: true,
    },
    fullName:{
      type:String,
      required:true,
    },
    mobileNumber:{
      type: Number,
      required: true,
    },
    pincode:{
      type:Number,
      required: true,
    },
    city:{
      type:String,
      required:true
    },state: {
      type:String,
      required:true,
    }

  }     
]
})


const User = mongoose.model('User', UserSchema);
const Cart = mongoose.model('Cart',cartSchema)
const UserAddress = mongoose.model('UserAddress',userAddressSchema);

module.exports = {
  User,
  Cart,
  UserAddress,
}

