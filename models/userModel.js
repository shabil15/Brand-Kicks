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
        max:20
      }
    }
  ]
},
{
  timestamps:true
})



const User = mongoose.model('User', UserSchema);
const Cart = mongoose.model('Cart',cartSchema)

module.exports = {
  User,
  Cart
}

