const mongoose = require('mongoose')

const bannerSchema= new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  banner:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  visibility: {
    type: Boolean,
    default:true,
  }
},{
  timestamps:true
});

const Banner = mongoose.model('Banner',bannerSchema)

module.exports = Banner;