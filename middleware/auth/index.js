const protect = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
};

const checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect(`/user/${req.user._id.toString()}`);
  }
  next();
};

const admin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.redirect("/login");
  }
};

module.exports = {
  protect,
  checkNotAuthenticated,
  admin,
};
