const Banner = require("../models/bannerModel");
const fs = require("fs").promises;
const path = require("path");

//============================== to Load the banners Load ===================================================================//

const bannersLoad = async (req, res, next) => {
  try {
    let banners = await Banner.find({});
    res.render("banners", { banners: banners });
  } catch (error) {
    next(error);
  }
};

//================================= to load the add banners page =============================================================//

const addbannersLoad = async (req, res, next) => {
  try {
    res.render("addbanner");
  } catch (error) {
    next(error);
  }
};

//=================================== to add the banner from the admin side=======================================================//

const addBanner = async (req, res, next) => {
  try {
    // Assuming that req.body.croppedImageData contains the cropped image data
    let croppedImageData = req.body.croppedImageData;

    // Convert data URI to Buffer
    let imageBuffer = Buffer.from(
      croppedImageData.replace(/^data:image\/jpeg;base64,/, ""),
      "base64"
    );

    // Use the existing multer storage to handle the file upload
    let filename;

    if (req.file && req.file.filename) {
      // If multer successfully uploaded a file, use that filename
      filename = req.file.filename;
    } else {
      // Otherwise, create a unique filename for the cropped image
      filename = `cropped_${Date.now()}.jpg`;

      // Save the buffer as a JPEG file
      await fs.writeFile(
        path.join(__dirname, "../public/products/banners", filename),
        imageBuffer
      );
    }

    let banner = new Banner({
      title: req.body.name,
      banner: filename,
      subtext: req.body.description,
      bannerURL: req.body.bannerURL,
      visibility: true,
    });

    let result = await banner.save();
    console.log(result);

    req.flash("success", "The Banner Added Successfully");
    res.redirect("/admin/banners");
  } catch (error) {
    next(error);
    req.flash("error", "An error occurred while adding the banner.");
    res.redirect("/admin/addbanner"); // Redirect back to the form with an error flash message
  }
};

//=================================== to delete the banner ======================================================//

// const deleteBanner= async(req,res)=>{
//   try {
//     let deleteItem= await Banner.deleteOne({_id:req.query.id})
//     console.log(deleteItem);

//     req.flash('success','the item Deleted Successfully')
//     res.redirect('/admin/banners')
//   } catch (error) {
//     console.log(error);
//   }
// }

const deletebanner = async (req, res, next) => {
  try {
    console.log(req.query.id);
    const deletebanner = await Banner.deleteOne({ _id: req.query.id });
    console.log(deletebanner);
    req.flash("success", "the Banner deleted successfully");
    res.redirect("/admin/banners");
  } catch (error) {
    next(error);
  }
};

//=================================== to change the visibility of the Banner ==========================================//

const visibilityBanner = async (req, res, next) => {
  try {
    const id = req.query.id;
    const banner = await Banner.findById(id);

    if (banner) {
      banner.visibility = !banner.visibility;
      await banner.save();
    }

    const banners = await Banner.find({});
    res.redirect("/admin/banners");
  } catch (error) {
    next(error);
  }
};

//=========================================== exporting the modules ============================================//

module.exports = {
  bannersLoad,
  addBanner,
  addbannersLoad,
  deletebanner,
  visibilityBanner,
};
