const router = require("express").Router();
const {
  getUsers,
  loginUser,
  pairUsers,
  logoutUser,
  deleteUser,
  registerUser,
  updateProfile,
  getUserProfile,
  getUnpairedUsers,
} = require("../controllers/users");
const {
  homeView,
  loginView,
  aboutView,
  contactView,
  registerView,
} = require("../controllers/views");
const { protect, checkNotAuthenticated, admin } = require("../middleware");

router.route("/").get(homeView);
router
  .route("/register")
  .post(checkNotAuthenticated, registerUser)
  .get(checkNotAuthenticated, registerView);
router
  .route("/login")
  .get(checkNotAuthenticated, loginView)
  .post(checkNotAuthenticated, loginUser);
router.get("/about", aboutView);
router.get("/contact", contactView);
router.post("/logout", logoutUser);
router.get("/users", protect, admin, getUsers);
router.get("/users/unpaired", protect, admin, getUnpairedUsers);
router
  .route("/user/:id")
  .get(protect, getUserProfile)
  .post(protect, updateProfile)
  .delete(protect, deleteUser);
router.post("/admin/pair", protect, admin, pairUsers);

module.exports = router;
