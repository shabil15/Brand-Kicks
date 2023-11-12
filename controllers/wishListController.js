const WishList = require('../models/wishlishtModel')
const Product = require('../models/productsModel').product


//================================ to add item to wishList ========================================================//


const addtoWishList = async (req,res) => {
  try {
    const {productId} = req.body;
    console.log(productId);
    const userWishList = await WishList.findOne({user:req.session.user_id})

    if(!userWishList) {
      const newWishList = new WishList({
        user:req.session.user_id,
        products :[{product:productId}],
      });

      const result = await newWishList.save();
      res.json({status:1});
    }else {
      const wishedAlready= userWishList.products.find(
        (item)=> item.product == productId
      );
      if(wishedAlready) {
        res.json({status:0});
      }else{
        userWishList.products.push({ product:productId});
        await userWishList.save();
        res.json({status:1});
      }
    }

  } catch (error) {
    console.log(error);
  }
}

//=================================== to Load the wishList Page ======================================================//


const wishListPageLoad = async (req,res)=>{
  try {

    const wishlist = await WishList.findOne({ user: req.session.user_id });
    

    if (wishlist) {
      const wishItem = [];
      for (const items of wishlist.products) {
        const productId = items.product;
        
        const productDetails = await Product.findById(productId, {
          _id:1,
          images: 1,
          product_name: 1,
          category: 1,
          product_price: 1,
          stock:1
        });
        const item = {
          product:productDetails
        }
        wishItem.push(item);
      }
      
      res.render("wishlist", {
         user: req.session.user_id,
         currentPage:'shop',
         item: wishItem 
      });
    } else {
      res.render("wishlist", {
         user: req.session.user_id,
         currentPage:'shop', 
         item: 0 
        });
    }
  } catch (error) {
    console.log(error);
  }
}

//=============================================== to remove wishList item ==============================================//

const   removeWishItem= async (req,res)=>{
  try {
    console.log(req.body);
    const {productId}= req.body;
    const wishList = await WishList.findOne({user:req.session.user_id})
    wishList.products = wishList.products.filter(
      (wishitem)=>wishitem.product.toString()!== productId.toString()
    )
    let remove =await wishList.save()
    res.json({status:"remove"})

    console.log(wishList,"removed");

  } catch (error) {
    console.log(error);
  }
}


module.exports= {
  addtoWishList,
  wishListPageLoad,
  removeWishItem
}