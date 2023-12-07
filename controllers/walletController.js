const User = require("../models/userModel").User;
const Razorpay = require("razorpay");
const crypto = require("crypto");

//===================== razorpay related ========================================//

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

//===================== wallet page Load ===============================//

const walletPageLoad = async (req, res, next) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    res.render("wallet", {
      currentPage: "profile",
      user: req.session.user_id,
      userData,
    });
  } catch (error) {
    next(error);
  }
};

//=============================== to add money to wallet ===========================//
const addToWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    
    const id = crypto.randomBytes(8).toString("hex");
    
    var options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "" + id,
    };
    

    instance.orders.create(options, (err, order) => {
      if (err) {
        res.json({ status: false });
      } else {
        res.json({ status: true, payment: order });
      }
    });
  } catch (error) {
    next(error);
  }
};

//================================= to verify payment ===============================================//

const verifyWalletPayment = async (req, res, next) => {
  try {
    const userId = req.session.user_id;

    const details = req.body;
    

    const amount = parseInt(details.order.amount) / 100;
    let hmac = crypto.createHmac("sha256", instance.key_secret);

    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );

    hmac = hmac.digest("hex");
    if (hmac == details.payment.razorpay_signature) {
      const walletHistory = {
        transactionDate: new Date(),
        transactionDetails: "Deposited via Razorpay",
        transactionType: "Credit",
        transactionAmount: amount,
      };
      await User.findByIdAndUpdate(
        { _id: userId },
        {
          $inc: {
            wallet: amount,
          },
          $push: {
            walletHistory,
          },
        }
      );

      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  walletPageLoad,
  addToWallet,
  verifyWalletPayment,
};
