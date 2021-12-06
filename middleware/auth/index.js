const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../../models/user");

const protect = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
  // let token = undefined;
  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith("Bearer")
  // ) {
  //   try {
  //     token = req.headers.authorization.split(" ")[1];
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //     if (decoded.id) {
  //       const user = await User.findById(decoded.id).select("-password");
  //       if (user) {
  //         req.user = user;
  //         req.token = token;
  //         next();
  //       } else {
  //         res.status(401);
  //         throw new Error("Not authorized, token failed");
  //       }
  //     } else {
  //       res.status(401);
  //       throw new Error("Invalid Token");
  //     }
  //   } catch (e) {
  //     res.status(401);
  //     throw new Error("Not authorized, token failed");
  //   }
  // }
};

const admin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

module.exports = {
  protect,
  admin,
};
