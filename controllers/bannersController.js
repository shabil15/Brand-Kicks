const Banner = require('../models/bannerModel')

const bannersLoad = async (req,res)=>{
  try {
    let banners = await Banner.find({})
    res.render('banners',{banners:banners})
  } catch (error) {
    console.log(error);
  }
}



const addbannersLoad= async(req,res) => {
  try {
    res.render('addbanner')
  } catch (error) {
    console.log(error);
  }
}



const addBanner=  async(req,res)=>{
  try {

    let img= await req.file.filename;
    console.log(img);
    let banner= new Banner({
      name:req.body.name,
      banner:img,
      description:req.body.description,
      visibility:true
    })

    let result = await banner.save()
    console.log(result);
    req.flash('success','The Banner Added Successfully')
    res.redirect('/admin/banners')

  } catch (error) {
    console.log(error);
  }
}


const deleteBanner= async(req,res)=>{
  try {
    let deleteItem= await Banner.deleteOne({_id:req.query.id})
    console.log(deleteItem);
    req.flash('success','the item Deleted Successfully')
    res.redirect('/admin/banners')
  } catch (error) {
    console.log(error);
  }
}


const visibilityBanner= async(req,res) =>{
  try {
    const id = req.query.id;
    const banner = await Banner.findById(id);

    if(banner) {
      banner.visibility =! banner.visibility;
      await banner.save();
    }

    const banners = await Banner.find({});
    res.render('banners',{banners:banners});
  } catch (error) {
    console.log(error);
  }
}

module.exports={

  bannersLoad,
  addBanner,
  addbannersLoad,
  deleteBanner,
  visibilityBanner
}
