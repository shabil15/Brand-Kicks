const mongoose = require('mongoose')

const bannerSchema= new mongoose.Schema({
  title:{
    type:String,
    
  },
  banner:{
    type:String,
    
  },
  subtext:{
    type:String,
    
  },
  visibility: {
    type: Boolean,
    default:true,
  },
  bannerURL: {
    type: String,
  }
},{
  timestamps:true
});

const Banner = mongoose.model('Banner',bannerSchema)

module.exports = Banner;