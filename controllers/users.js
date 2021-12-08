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
const loginUser = async (req, res) =>
  passport.authenticate("local", {
    // successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, () => {
    res.redirect(`/user/${req.user._id.toString()}`);
  });

/**
 * @description login user
 * @route GET /api/users/login
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    phone_number,
    address,
    item,
    amount,
  } = req.body;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (emailRegex.test(email) === false) {
    res.status(400);
    throw new Error("Invalid email");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.render("register", { error: "User already exists" });
  }

  let gift;
  if (item || amount) {
    gift = await Gift.create({
      item,
      amount,
    });
  }

  const user = await User.create({
    first_name,
    last_name,
    email,
    password,
    address,
    gift_choice: gift ? gift._id : null,
    phone_number,
  });

  if (user) {
    passport.authenticate("local", {
      failureRedirect: "/register",
      failureFlash: true,
    })(req, res, function () {
      res.redirect(`/user/${user._id.toString()}`);
    });
  } else {
    res.redirect("/register");
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
  const user = await User.findById(req.user._id)
    .populate("gift_choice")
    .select("-password");

  res.render("profile", { user });
});

/**
 * @description Update user
 * @route PATCH /api/users/:id
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  let gift;
  if (req.body.item || req.body.amount) {
    gift = await Gift.findByIdAndUpdate(
      req.user.gift_choice,
      {
        $set: { item: req.body.item, amount: req.body.amount },
      },
      { new: true }
    );
    if (!gift) {
      gift = await Gift.create({
        item: req.body.item,
        amount: req.body.amount,
      });
    }
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        ...req.body,
        gift_choice: gift ? gift._id : req.user.gift_choice,
      },
    },
    { new: true }
  )
    .populate("gift_choice")
    .select("-password");

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
  res.redirect("/login");
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
