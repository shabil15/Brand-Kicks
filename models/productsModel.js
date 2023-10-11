const mongoose= require('mongoose');

const categorySchema = mongoose.Schema({
  category_name:{
    type:String,
    required:true
  },
  category_description:{
    type:String,
    required:true
  },
  is_listed:{
    type:Boolean,
    required:true
  }
})

const category =mongoose.model('category',categorySchema)


module.exports= {
  category
}