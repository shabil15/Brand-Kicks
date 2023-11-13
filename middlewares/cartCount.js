const User =require('../models/userModel').User
const Cart = require('../models/userModel').Cart

const cartMiddleWare = async (req,res,next) =>{
  try {
    if(req.session.user_id) {
      const user = req.session.user_id
      const userData = await User.findById({_id:user})

      console.log("userData",userData);

      if(!userData) {
        return res.redirect('/login')
      }

      const cart = await Cart.findOne({user:user})
      const count = cart?cart.products.length :0;
      res.locals.count =count
      next()
    }else{
      const count = 0
      res.locals.count = count 
      next()
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = cartMiddleWare;