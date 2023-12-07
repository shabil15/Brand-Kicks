const Category = require("../models/productsModel").category;
const Product = require("../models/productsModel").product;
const Offer = require('../models/offerModel')

const path = require("path");
const sharp =require("sharp");


//========================== to get the product Details with its id ===========================================//

const getProductDetails = async(id)=>{
  try {
    let product=await Product.find({_id:id}).populate('offer');
    
    return product[0]
  } catch (error) {
    console.log(error);
  }
}



//===================load the Product Page=========================================================================//

const productsLoad = async (req, res, next) => {
  try {
    const page=req.query.page || 1;
    const pageSize =5;

    const skip = (page -1)*pageSize;

    

    let products = await Product.find({}).populate('category').populate('offer').skip(skip)
    .limit(pageSize);
    const availableOffers = await Offer.find({ status : true, expiryDate : { $gte : new Date() }})
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts/pageSize);

    const categories = await Category.find({is_listed:true})
    

    res.render('products',
    {products:products,
    category:categories,
    currentPage:page,
    totalPages:totalPages,
    availableOffers:availableOffers
    }
    )
  } catch (error) {
    next(error);
  }
};


//==========================to load the add to product Page=======================================================//

const addProductLoad = async (req, res,next) => {
  try {
    const categories = await Category.find({});
    res.render("addProducts", { categories: categories });
  } catch (error) {
    next(error);
  }
};


//===================to add the Product==============================================================================//

const addProduct = async (req, res) => {
  try {
    let details = req.body;
    const files = await req.files;
    

    const img = [
      files.image1[0].filename,
      files.image2[0].filename,
      files.image3[0].filename,
      files.image4[0].filename,
    ];

    for (let i = 0; i < img.length; i++) {
      await sharp("public/products/images/" + img[i])
        .resize(480, 480)
        .toFile("public/products/croped/" + img[i]);
    }

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
    
    if(result){
      req.flash('success','The Product added Successfully');
      res.redirect("/admin/products");
    }else{
      req.flash('error','Something went wrong please try again!');
      res.redirect("/admin/addproduct");
    }
  } catch (error) {
    console.log(error);
  }
};


//===================to unlist the Product===========================================================================//

const unlistProduct = async (req, res) => {
  let id = req.query.id;
  
  let product = await Product.findById(id);
  if (product) {
    product.is_listed = !product.is_listed;
    await product.save();
  }

  const products = await Product.find({});
  
  res.redirect('/admin/products')
};

//==================to load the edit product page===================================================================//

const editProductLoad = async(req,res,next)=>{
  try {
    const categories = await Category.find({});
    const product = await getProductDetails(req.query.id)
    res.render('editproduct',{
      product:product,
      categories:categories})
  } catch (error) {
    next(error)
  }
}


//======================================== to Load the product Details Page =======================================//

const productPageLoad = async (req,res,next)=>{
  try {
    const product = await getProductDetails(req.query.id)
    // let relatedProducts = await getProductDetails({'$and':[{category:product.category},{_id:{"$ne":product._id}}]})
    const userId  = req.session.user_id
    const reviews = product.reviews

    const userReviews = reviews.filter(review=> review.user.userId=== userId)

     // Calculate the average rating
     const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
     const averageRating = totalRatings / reviews.length;
    
    
    res.render('product',{
      currentPage:'shop',
      product:product,
      user:req.session.user_id,
      reviews: reviews,
      userReviews:userReviews,
      averageRating:averageRating.toFixed(1) 
    })
  } catch (error) {
    next(error);
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

      const img = [
        imagesFiles.image1 ? imagesFiles.image1[0].filename: currentData.images.image1,
        imagesFiles.image2 ? imagesFiles.image2[0].filename: currentData.images.image2,
        imagesFiles.image3 ? imagesFiles.image3[0].filename: currentData.images.image3,
        imagesFiles.image4 ? imagesFiles.image4[0].filename: currentData.images.image4,
      ];
  
      for (let i = 0; i < img.length; i++) {
        await sharp("public/products/images/" + img[i])
          .resize(480, 480)
          .toFile("public/products/croped/" + img[i]);
      }

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
    .populate('category').populate('offer')

    const availableOffers = await Offer.find({ status : true, expiryDate : { $gte : new Date() }})

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
      availableOffers:availableOffers
    })
  } catch (error) {
    
  }
}


//========================================== shop page loading with pagination ===============================//

const shopPageLoad = async(req,res,next) => {
  try {
    const categories = await Category.find()
    let page = req.query.page|| 1;
    let pageDB = Number(page) -1.
    let productPerPage = 9;
    let totalProduct = await Product.countDocuments();
    let totalPage = Math.ceil(totalProduct/productPerPage);
    let products = await Product.find()
    .skip(pageDB * productPerPage )
    .limit(productPerPage);

    res.render('shop',{
      products : products,
      user:req.session.user_id,
      totalPage,
      curentPage:Number(page),
      categories,
      currentPage:'shop'
    })
  } catch (error) {
    next(error);
  }
}

//=================================== query filtering =======================================//

// const queryFilter = async (req,res,next) =>{
//   try {
//     const categories = await Category.find();
//     const page = req.query.page || 1;
//     const pageDB = Number(page)-1;
//     const productPerPage = 9;
//     const key= req.query.key || "";
//     let query = {};

//     let totalProduct;

//     if(key!=="") {
//       totalProduct = await Product.countDocuments({
//         $or: [
//           { product_name : {$regex:key,$options:"i"}},
//           {category:{$regex:key,$options:"i"}}
//         ]
//       })
      
//     }else {
//       if(req.query.category){
//         const Categories = req.query.category.split("%2C").map(cat=>cat.charAt(0).toUpperCase() + cat.slice(1)); 
//         query.category = {$in:Categories}
//       }

//       if(req.query.gender) {
//         const capitalizedGender = req.query.gender.split(",").map(cat=>cat.charAt(0).toUpperCase()+cat.slice(1));
//         query.gender = capitalizedGender;
//       }

//       if(req.query.brand) {
//         const brand = req.query.brand.split(",").map(brnd=>brnd.charAt(0).toUpperCase()+brnd.slice(1));
//         query.brand = brand;
//       }

//       if(req.query.minPrice && req.query.maxPrice) {
//         const minPrice = parseFloat(req.query.minPrice);
//         const maxPrice = parseFloat(req.query.maxPrice);
//         query.product_price = {$gte: minPrice ,$lte:maxPrice};
//       }

//       totalProduct = await Product.countDocuments(query);
//     }

//     const totalPage = Math.ceil(totalProduct/ productPerPage);

//     const products = key !== ""
//     ? await Product.find({
//       $or: [
//         { product_name : {$regex:key,$options:"i"}},
//         {category:{$regex:key,$options:"i"}}
//       ] 
// })
//     .populate('category')
//     .populate('offer')
//     .skip(pageDB * productPerPage)
//     .limit(productPerPage)
//     :await Product.find(query)
//     .populate('category')
//     .populate('offer')
//     .skip(pageDB * productPerPage)
//     .limit(productPerPage);

    
    
//     const totalProducts = await Product.countDocuments();
    

//     res.render("shop", {
//       products,
//       user:req.session.user_id,
//       totalPage,
//       curentPage: Number(page),
//       currentPage:'shop',
//       categories,
//       totalProducts
//     })
//   } catch (error) {
//     next(error);
//   }
// }

const queryFilter = async (req, res, next) => {
  try {
    const categories = await Category.find();
    const page = req.query.page || 1;
    const pageDB = Number(page) - 1;
    const productPerPage = 9;
    const key = req.query.key || "";
    let query = {}; 

    if (key !== "") {
      query.$or = [
        { product_name: { $regex: key, $options: "i" } },
        { category: { $regex: key, $options: "i" } },
      ];
    }

    if (req.query.category) {
      const categories = req.query.category
        .split("%2C")
        .map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1));
      query.category = { $in: categories };
    }

    if (req.query.gender) {
      const genders = req.query.gender
        .split(",")
        .map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1));
      query.gender = { $in: genders };
    }

    if (req.query.brand) {
      const brands = req.query.brand
        .split(",")
        .map((brnd) => brnd.charAt(0).toUpperCase() + brnd.slice(1));
      query.brand = { $in: brands };
    }

    if (req.query.minPrice && req.query.maxPrice) {
      const minPrice = parseFloat(req.query.minPrice);
      const maxPrice = parseFloat(req.query.maxPrice);
      query.product_price = { $gte: minPrice, $lte: maxPrice };
    }

    const totalProduct = await Product.countDocuments(query);

    const totalPage = Math.ceil(totalProduct / productPerPage);

    const products = await Product.find(query)
      .populate('category')
      .populate('offer')
      .skip(pageDB * productPerPage)
      .limit(productPerPage);

    const totalProducts = await Product.countDocuments();

    res.render("shop", {
      products,
      user: req.session.user_id,
      totalPage,
      curentPage: Number(page),
      currentPage: 'shop',
      categories,
      totalProducts,
    });
  } catch (error) {
    next(error);
  }
};





//============================================ to apply the product Offer  ===================================================//

const applyProductOffer = async (req,res,next) => {
  try {
    const productId = req.body.productId;
    const offerId = req.body.offerId;

    const offer = await Offer.findOne({_id:offerId});

    if(!offer) {
      return res.json({ success: false,message:'Offer not found '})
    } 

    const product = await Product.findOne({_id:productId}).populate('category')

    if(!product) {
      return res.json({success:false,message:'Product not found'});
    }

    const categoryDiscount = product.category && product.category.offer
    ? await Offer.findOne({_id:product.category.offer})
    :0;
    

    const discountPercentage = offer.percentage;
    const originalPrice = parseFloat(product.product_price);
    const discountedPrice = originalPrice - (originalPrice * discountPercentage)/100;

    if(categoryDiscount && categoryDiscount.percentage>discountPercentage) {
      return res.json({success:false,message:'Category offer has greate Discount'})
    }

    await Product.updateOne(
      {_id:productId},
      {
        $set: {
          offer: offerId,
          discountedPrice: discountedPrice
        }
      }
    ) 

    const updatedProduct = await Product.findOne({_id: productId}).populate('offer');
    res.json({success: true,data: updatedProduct});

  } catch (error) {
    next(error);
  }
}


const removeProductOffer = async (req,res,next) => {
  try {
    const { productId } = req.body;
    

    const remove = await Product.updateOne(
      { _id: productId },
      {
        $unset: {
          offer: '',
          discountedPrice: '',
        },
      }
    );
      
    res.json({ success: true ,data:remove });
  } catch (error) {
    next(error)
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
  searchProducts,
  shopPageLoad,
  queryFilter,
  applyProductOffer,
  removeProductOffer
};
