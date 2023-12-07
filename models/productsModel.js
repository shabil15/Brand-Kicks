
const mongoose= require('mongoose');


const productSchema = mongoose.Schema({
  product_name:{
    type:String,
    required:true,
  },
  product_price:{
    type:Number,
    required:true,
  },
  category:{
    type:String,
    required:true,
  },
  gender:{
    type:String,
    required:true
  },
  brand:{
    type:String,
    required:true
  },
  stock:{
    type:Number,
    required:true
  },
  product_description:{
    type:String,
    required:true
  },
  is_listed:{
    type:Boolean,
    default: true, 
  },
  offer : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'offer'
  },
  discountedPrice:{
    type:Number
  },
  images:{
    image1:{
      type:String,
      required:true
    },
    image2:{
      type:String,
      required:true
    },
    image3:{
      type:String,
      required:true
    },
    image4:{
      type:String,
      required:true
    }

  },
  reviews : [
    {
      user: {
        userId:{
          type:String
        },
        firstName: {
          type: String,
        },
        secondName: {
          type: String,
        }
      },
      rating: {
        type: Number,
      },
      comment: {
        type:String,
      },
      date : {
        type: Date,
        default: Date.now,
      }
    }
  ]

},{
  timestamps:true
})

const categorySchema = mongoose.Schema({
  category_name:{
    type:String,
    
  },
  category_description:{
    type:String,
    
  },
  offer : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'offer'
  },
  is_listed:{
    type:Boolean,
  }
})

const product= mongoose.model('product',productSchema)
const category =mongoose.model('category',categorySchema)



module.exports= {
  category,
  product
}