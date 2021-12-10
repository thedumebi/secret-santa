const User = require("../models/user");
const asyncHandler = require("express-async-handler");

/**
 * @description Get login view
 * @route GET /login
 * @access Public
 */
const loginView = (req, res) => {
  res.render("login");
};

/**
 * @description Get register view
 * @route GET /register
 * @access Public
 */
const registerView = (req, res) => {
  res.render("register");
};

/**
 * @description Get about view
 * @route GET /about
 * @access Public
 */
const aboutView = (req, res) => {
  res.render("about");
};

/**
 * @description Get contact view
 * @route GET /contact
 * @access Public
 */
const contactView = (req, res) => {
  res.render("contact");
};

/**
 * @description Get home view
 * @route GET /
 * @access Public
 */
const homeView = (req, res) => {
  res.render("home", { user: req.user });
};

/**
 * @description Get profile view
 * @route GET /
 * @access Private
 */
const partnerView = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate([
      "gift_choice",
      { path: "partner", populate: { path: "gift_choice" } },
    ])
    .select("-password");
  res.render("partner", { user });
});

module.exports = {
  loginView,
  registerView,
  aboutView,
  contactView,
  homeView,
  partnerView,
};
