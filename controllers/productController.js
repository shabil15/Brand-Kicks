const Category = require("../models/productsModel").category;
const Product = require("../models/productsModel").product;
const path = require("path");


//========================== to get the product Details with its id ===========================================//

const getProductDetails = async(id)=>{
  try {
    let product=await Product.find({_id:id})
    
    return product[0]
  } catch (error) {
    console.log(error);
  }
}



//===================load the Product Page=========================================================================//

const productsLoad = async (req, res) => {
  try {
    const page=req.query.page || 1;
    const pageSize =5;

    const skip = (page -1)*pageSize;

    

    let products = await Product.find({}).populate('category').skip(skip)
    .limit(pageSize);

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts/pageSize);

    const categories = await Category.find({is_listed:true})
    console.log(categories);

    res.render('products',
    {products:products,
    category:categories,
    currentPage:page,
    totalPages:totalPages
    }
    )
  } catch (error) {
    console.log(error);
  }
};


//==========================to load the add to product Page=======================================================//

const addProductLoad = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("addProducts", { categories: categories });
  } catch (error) {
    console.log(error);
  }
};


//===================to add the Product==============================================================================//

const addProduct = async (req, res) => {
  try {
    let details = req.body;
    const files = await req.files;
    console.log(files);

    const product = new Product({
      product_name: details.product_name,
      product_price: details.product_price,
      category: details.category,
      gender: details.gender,
      brand:details.brand,
      stock: details.stock,
      product_description: details.product_description,
      "images.image1": files.image1[0].filename,
      "images.image2": files.image2[0].filename,
      "images.image3": files.image3[0].filename,
      "images.image4": files.image4[0].filename,
    });

    const result = await product.save();
    console.log(result);
    if(result){
      req.flash('success','The Product added Successfully');
      res.redirect("/admin/products");
    }else{
      req.flash('error','Something went wrong please try again!');
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error);
  }
};


//===================to unlist the Product===========================================================================//

const unlistProduct = async (req, res) => {
  let id = req.query.id;
  console.log(id);
  let product = await Product.findById(id);
  if (product) {
    product.is_listed = !product.is_listed;
    await product.save();
  }

  const products = await Product.find({});
  
  res.redirect('/admin/products')
};

//==================to load the edit product page===================================================================//

const editProductLoad = async(req,res)=>{
  try {
    const categories = await Category.find({});
    const product = await getProductDetails(req.query.id)
    res.render('editproduct',{
      product:product,
      categories:categories})
  } catch (error) {
    console.log(error);
  }
}


//======================================== to Load the product Details Page =======================================//

const productPageLoad = async (req,res)=>{
  try {
    const product = await getProductDetails(req.query.id)
    // let relatedProducts = await getProductDetails({'$and':[{category:product.category},{_id:{"$ne":product._id}}]})
    res.render('product',{
      currentPage:'shop',
      product:product,
      user:req.session.user_id, 
    })
  } catch (error) {
    console.log(error);
  }
}

//============================================= to edit the Product Details from the Admin Side ===================================//

const editProduct= async(req,res)=>{
  try {
    let details=req.body;
    let imagesFiles= req.files;
    let currentData= await getProductDetails(req.query.id);
  
    let img1,img2,img3,img4;

      img1 = imagesFiles.image1 ? imagesFiles.image1[0].filename : currentData.images.image1;
      img2 = imagesFiles.image2 ? imagesFiles.image2[0].filename : currentData.images.image2;
      img3 = imagesFiles.image3 ? imagesFiles.image3[0].filename : currentData.images.image3;
      img4 = imagesFiles.image4 ? imagesFiles.image4[0].filename : currentData.images.image4;

      const update= await Product.updateOne(
        {_id:req.query.id},
        {
          $set:{
            product_name:details.product_name,
            product_price:details.product_price,
            category:details.category,
            gender:details.category,
            brand:details.brand,
            product_description:details.product_description,
            stock:details.stock,
            "images.image1": img1,
            "images.image2": img2,
            "images.image3": img3,
            "images.image4": img4
          }
        })
        console.log(update);
        if(update){
          req.flash('success','The Prodect successfully Updated');
        res.redirect('/admin/products')
        }else{
          req.flash('error','Something went wrong Please Try again!')
          res.redirect('/admin/prodcts')
        }
  } catch (error) {
    console.log(error);
  }
}


//================================search products=============================================//


const searchProducts = async(req,res)=>{
  try {
    const keyword =req.query.keyword;
    const page = req.query.page || 1;
    const pageSize =5;

    const products = await Product.find({
      $or:[
        {product_name:{$regex:keyword,$options:'i'}},
        {product_description:{$regex:keyword,$options:'i'}}
      ]
    })
    .skip((page-1)*pageSize)
    .limit(pageSize)
    .populate('category');

    const totalProducts = await Product.countDocuments({
      $or:[
        {product_name:{$regex:keyword,$options:'i'}},
        {product_description:{$regex:keyword,$options:'i'}}
      ]
    })

    const totalPages = Math.ceil(totalProducts/pageSize);

    const categories = await Category.find();

    res.render('products',{
      products:products,
      category:categories,
      currentPage:page,
      totalPages:totalPages,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error')
  }
}

module.exports = {
  addProductLoad,
  addProduct,
  productsLoad,
  unlistProduct,
  editProductLoad,
  editProduct,
  productPageLoad,
  searchProducts
};
