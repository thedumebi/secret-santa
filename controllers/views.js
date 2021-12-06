const asyncHandler = require("express-async-handler");
const {} = require("./users");

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

module.exports = {
  loginView,
  registerView,
  aboutView,
  contactView,
};
