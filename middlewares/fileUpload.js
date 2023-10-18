const multer = require("multer");
const path = require("path");
const sharp= require('sharp')

const storageProduct = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/products/images"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadProduct = multer({ storage: storageProduct });

const productImagesUpload = uploadProduct.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

const storageBanner = multer.diskStorage({
  destination:function(req,file,callbacks){
      callbacks(null,path.join(__dirname, '../public/products/banners'))
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
})

const uploadBanner= multer({storage:storageBanner})



module.exports = {
  productImagesUpload,
  uploadBanner
};
