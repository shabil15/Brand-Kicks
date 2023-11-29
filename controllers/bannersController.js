const Banner = require('../models/bannerModel')


//============================== to Load the banners Load ===================================================================//

const bannersLoad = async (req,res)=>{
  try {
    let banners = await Banner.find({})
    res.render('banners',{banners:banners})
  } catch (error) {
    console.log(error);
  }
}

//================================= to load the add banners page =============================================================//

const addbannersLoad= async(req,res) => {
  try {
    res.render('addbanner')
  } catch (error) {
    console.log(error);
  }
}

//=================================== to add the banner from the admin side=======================================================//

const addBanner=  async(req,res)=>{
  try {

    let img= await req.file.filename;
    console.log(img);
    let banner= new Banner({
      title:req.body.name,
      banner:img,
      subtext:req.body.description,
      bannerURL:req.body.bannerURL,
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

//=================================== to delete the banner ======================================================//

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

//=================================== to change the visibility of the Banner ==========================================//

const visibilityBanner= async(req,res) =>{
  try {
    const id = req.query.id;
    const banner = await Banner.findById(id);

    if(banner) {
      banner.visibility =! banner.visibility;
      await banner.save();
    }

    const banners = await Banner.find({});
    res.redirect('/admin/banners')
  } catch (error) {
    console.log(error);
  }
}

//=========================================== exporting the modules ============================================//

module.exports={

  bannersLoad,
  addBanner,
  addbannersLoad,
  deleteBanner,
  visibilityBanner
}
