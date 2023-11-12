const User = require('../models/userModel').User;
const Razorpay = require("razorpay");
const crypto = require("crypto");

//===================== razorpay related ========================================//


var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

//===================== wallet page Load ===============================//


const walletPageLoad  = async(req,res) =>{
  try {
    const userData = await User.findOne({_id:req.session.user_id})
    res.render('wallet',{
      currentPage:'profile',
      user:req.session.user_id,
      userData,
    })
  } catch (error) {
    console.log(error);
  }
}


//=============================== to add money to wallet ===========================//
const addToWallet = async (req,res)=>{
  try {
    const {amount }= req.body;
    console.log(req.body);
    console.log(amount);
    const id = crypto.randomBytes(8).toString('hex')
    console.log(id);
    var options ={
      amount : amount*100,
      currency : 'INR',
      reciept:""+id
    }
    console.log(options);

    instance.orders.create(options,(err,order)=>{
      if(err) {
        res.json({status:false})
      }else{
        res.json({status:true,payment:order})
      }
    })
  } catch (error) {
    console.log(error);
  }
}

module.exports= {
  walletPageLoad,
  addToWallet,

}