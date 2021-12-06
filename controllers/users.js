const passport = require("passport");
const User = require("../models/user");
const Gift = require("../models/gift");
// const generateToken = require("../utils/token");
const asyncHandler = require("express-async-handler");

/**
 * @description login user
 * @route POST /api/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const login = req.login(user);
    console.log({ login });
    if (login) {
      passport.authenticate("local", {
        failureRedirect: "/login",
        failureMessage: true,
      })(req, res, function () {
        res.redirect("/profile");
      });
    }
    // const { password, ...otherKeys } = user._doc;
    // res.status(200).json({
    //   ...otherKeys,
    //   fullname: user.getFullName(),
    //   token: generateToken(user._id),
    // });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

/**
 * @description login user
 * @route GET /api/users/login
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { email, password, first_name, last_name, phone_number, item, amount } =
    req.body;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (emailRegex.test(email) === false) {
    res.status(400);
    throw new Error("Invalid email");
  }

  let gift;
  if (item || amount) {
    gift = await Gift.create({
      item,
      amount,
    });
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    first_name,
    last_name,
    email,
    password,
    gift_choice: gift ? gift._id : null,
    phone_number,
  });
  if (user) {
    // const newUser = await User.findById(user._id).select("-password");
    // res.status(200).json({
    //   ...newUser._doc,
    //   token: generateToken(newUser._id),
    // });
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureMessage: true,
    })(req, res, function () {
      res.redirect("/profile");
    });
  } else {
    res.redirect("/register");
    // res.status(500);
    // throw new Error("Invalid user data");
  }
});

/**
 * @description login user
 * @route GET /api/users/login
 * @access Public
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ created_at: -1 });
  res.status(200).json(users);
});

/**
 * @description get der details
 * @route POST /api/users/:id
 * @access Public
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.render("profile", { user });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @description Update user
 * @route PATCH /api/users/:id
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  ).select("-password");

  if (user) {
    res.render("profile", { user });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @description Delete user
 * @route DELETE /api/users/:id
 * @access Private
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.status(200).json({ message: "User deleted." });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @description Logout user
 * @route DELETE /api/users/logout
 * @access Private
 */
const logoutUser = (req, res) => {
  req.logout();
  res.redirect("/");
};

module.exports = {
  loginUser,
  registerUser,
  getUsers,
  getUserProfile,
  updateProfile,
  deleteUser,
  logoutUser,
};
