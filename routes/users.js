const userRouter = require("express").Router();
const {
  getUsers,
  loginUser,
  deleteUser,
  registerUser,
  updateProfile,
  getUserProfile,
  logoutUser,
} = require("../controllers/users");
const { protect, admin } = require("../middleware");

userRouter.route("/").post(registerUser).get(protect, admin, getUsers);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter
  .route("/user/:id")
  .get(protect, getUserProfile)
  .patch(protect, updateProfile)
  .delete(protect, deleteUser);

module.exports = userRouter;
