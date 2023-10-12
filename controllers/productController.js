
const Category=require("../models/productsModel").category
const Product= require("../models/productsModel").product
const path = require('path');



const addProductLoad = async (req,res)=>{
  try {
    const categories = await Category.find({})
    res.render('addProducts',{categories:categories})
  } catch (error) {
    console.log(error);
  }
}


const addProduct= async (req,res)=>{
  try {
    let details= req.body;
    const files = await req.files;
    console.log(files);
    
    const product= new Product({
      product_name:details.product_name,
      product_price:details.product_price,
      category:details.category,
      gender:details.gender,
      stock:details.stock,
      product_description:details.product_description,
      "images.image1":files.image1[0].filename,
      "images.image2":files.image2[0].filename,
      "images.image3":files.image3[0].filename,
      "images.image4":files.image4[0].filename
    })

   const result = await product.save()
    console.log(result);
    // res.redirect('/admin/products')
  } catch (error) {
    console.log(error);
  }
}


module.exports={
  addProductLoad,
  addProduct,
}