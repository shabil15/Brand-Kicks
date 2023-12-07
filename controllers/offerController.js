const User = require("../models/userModel");
const Product = require("../models/productsModel").product;
const Category = require("../models/productsModel").category;
const Coupon = require("../models/couponModel").Coupon;
const Offer = require("../models/offerModel");

const loadAddOffer = async (req, res, next) => {
  try {
    res.render("addOffer");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addOffer = async (req, res, next) => {
  try {
    const { search, page } = req.query;
    const { startingDate, expiryDate, percentage } = req.body;
    const name = req.body.name.toUpperCase();
    const offerExist = await Offer.findOne({ name: name });

    if (offerExist) {
      req.flash("error", "The offer already exists");
      res.redirect("/admin/addOffer");
    } else {
      const offer = new Offer({
        name: name,
        startingDate: startingDate,
        expiryDate: expiryDate,
        percentage: percentage,
        search: search,
        page: page,
      });

      await offer.save();
      res.redirect("/admin/offers");
    }
  } catch (error) {
    next(error);
  }
};

const loadOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find();
    res.render("offers", {
      offers: offers,
      now: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

const loadEditOffer = async (req, res, next) => {
  try {
    const id = req.params.id;
    const offer = await Offer.findOne({ _id: id });

    res.render("editOffer", {
      offer: offer,
    });
  } catch (error) {
    next(error);
  }
};

const editOffer = async (req, res, next) => {
  try {
    const { id, name, startingDate, expiryDate, percentage } = req.body;
    await Offer.updateOne(
      { _id: id },
      {
        $set: {
          name: name.toUpperCase(),
          startingDate: startingDate,
          expiryDate: expiryDate,
          percentage: percentage,
        },
      }
    );
    res.redirect("/admin/offers");
  } catch (error) {
    next(error);
  }
};

const cancelOffer = async (req, res, next) => {
  try {
    const { offerId } = req.body;
    console.log(req.body);
    await Offer.updateOne(
      { _id: offerId },
      {
        $set: {
          status: false,
        },
      }
    );
    res.json({ cancelled: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadAddOffer,
  addOffer,
  loadOffers,
  loadEditOffer,
  editOffer,
  cancelOffer,
};
