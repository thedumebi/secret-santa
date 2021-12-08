const passport = require("passport");
const User = require("../models/user");
const Gift = require("../models/gift");
const returnHtml = require("../utils/email");
const transporter = require("../utils/nodemailer");
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
    gender,
    item,
    address,
    amount,
    bank_name,
    account_number,
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
    if (item && !address) {
      return res.render("register", {
        error: "Please provide your address for item delivery",
      });
    }
    if ((amount && !bank_name) || (amount && !account_number)) {
      return res.render("register", {
        error: "Please provide your account details for cash gift",
      });
    }
    gift = await Gift.create({
      item,
      address,
      amount,
      bank_name,
      account_number,
    });
  }

  const user = await User.create({
    first_name,
    last_name,
    gender,
    email,
    password,
    gift_choice: gift ? gift._id : null,
    phone_number,
  });

  if (user) {
    // send email
    const data = {
      user,
    };
    const html = await returnHtml("registerEmail", data);
    try {
      const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Welcome",
        encoding: "utf-8",
        html,
      };
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.log(err);
    }

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
 * @description Get all user
 * @route GET /admin/users/
 * @access Public
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .populate(["gift_choice", "partner"])
    .select("-password")
    .sort({ created_at: -1 });
  res.render("users", { users, user: req.user, type: "all" });
});

/**
 * @description Get all unpaired users
 * @route GET /admin/users/unpaired
 * @access Public
 */
const getUnpairedUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ partner: null })
    .populate(["gift_choice", "partner"])
    .select("-password")
    .sort({ created_at: -1 });
  res.render("users", { users, user: req.user, type: "unpaired" });
});

/**
 * @description pair users
 * @route GET /admin/users/unpaired
 * @access Public
 */
const pairUsers = asyncHandler(async (req, res) => {
  const unpairedUsers = (
    await User.find({ partner: null }).sort({ created_at: -1 })
  ).map((user) => ({ id: user._id, giving: false, receiving: false }));

  // pair users
  let userSize = unpairedUsers.length;
  while (userSize > 1) {
    // get a random user
    const random = Math.floor(Math.random() * unpairedUsers.length);
    let user = unpairedUsers[random];
    // check giving and receiving status
    if (user.giving === false || user.receiving === false) {
      // get another user
      if (user.giving === false) {
        // get another user
        let user2;
        let random2;
        let canUserReceive = false;
        while (!canUserReceive) {
          random2 = Math.floor(Math.random() * unpairedUsers.length);
          if (random2 == random) {
            random2 += 1;
          }
          user2 = unpairedUsers[random2];
          if (user2.receiving === false) {
            canUserReceive = true;
          }
        }

        // partner user2 with 1
        const user2Update = await User.findByIdAndUpdate(
          user2.id,
          { $set: { partner: user.id } },
          { new: true }
        );

        // send email
        const data = {
          user: user2Update,
        };
        const html = await returnHtml("assigned", data);
        try {
          const mailOptions = {
            from: process.env.EMAIL,
            to: user2Update.email,
            subject: "Secret Santa Assignment",
            encoding: "utf-8",
            html,
          };
          await transporter.sendMail(mailOptions);
        } catch (err) {
          console.log(err);
        }

        user.giving = true;
        user2.receiving = true;
        if (user2.giving === true && user2.receiving === true) {
          unpairedUsers.splice(random2, 1);
          userSize--;
        }
      } else if (user.receiving === false) {
        let user2;
        let random2;
        let canUserGive = false;
        while (!canUserGive) {
          random2 = Math.floor(Math.random() * unpairedUsers.length);
          if (random2 == random) {
            random2 += 1;
          }
          user2 = unpairedUsers[random2];
          if (user2.giving === false) {
            canUserGive = true;
          }
        }

        // partner user2 with 1
        const userUpdate = await User.findByIdAndUpdate(
          user.id,
          { $set: { partner: user2.id } },
          { new: true }
        );

        // send email
        const data = {
          user: userUpdate,
        };
        const html = await returnHtml("assigned", data);
        try {
          const mailOptions = {
            from: process.env.EMAIL,
            to: userUpdate.email,
            subject: "Secret Santa Assignment",
            encoding: "utf-8",
            html,
          };
          await transporter.sendMail(mailOptions);
        } catch (err) {
          console.log(err);
        }

        user.receiving = true;
        user2.giving = true;
        if (user2.giving === true && user2.receiving === true) {
          unpairedUsers.splice(random2, 1);
          userSize--;
        }
      }
    }
    if (user.giving === true && user.receiving === true) {
      unpairedUsers.splice(random, 1);
      userSize--;
    }
  }

  // let partners = [];
  // let userSize = unpairedUsers.length;
  // while (userSize > 0) {
  //   const random = Math.floor(Math.random() * unpairedUsers.length);
  //   let user;
  //   if (partners.length === 1) {
  //     user = unpairedUsers[random];
  //   } else if (partners.length === 0) {
  //     user = unpairedUsers.splice(random, 1)[0];
  //   }
  //   partners.push(user);
  //   if (partners.length === 2) {
  //     const [user1, user2] = partners;
  //     const user1Update = await User.findByIdAndUpdate(
  //       user1,
  //       { $set: { partner: user2 } },
  //       { new: true }
  //     );

  //     // send emails to the users telling them they have been assigned santas
  //     const data = {
  //       user: user1Update,
  //     };
  //     const html = await returnHtml("assigned", data);
  //     try {
  //       const mailOptions = {
  //         from: process.env.EMAIL,
  //         to: user1Update.email,
  //         subject: "Secret Santa Assignment",
  //         encoding: "utf-8",
  //         html,
  //       };
  //       await transporter.sendMail(mailOptions);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //     // reset partners
  //     partners = [];
  //   }
  //   userSize--;
  // }

  res.redirect("/users");
});

/**
 * @description get der details
 * @route POST /api/users/:id
 * @access Public
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate([
      "gift_choice",
      { path: "partner", populate: { path: "gift_choice" } },
    ])
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
  const { item, amount, bank_name, account_number, address, item_choice } =
    req.body;
  if (item || amount) {
    if (item && !address) {
      return res.render("profile", {
        user: req.user,
        error: "Please provide your address for item delivery",
      });
    }
    if ((amount && !bank_name) || (amount && !account_number)) {
      return res.render("profile", {
        user: req.user,
        error: "Please provide your account details for cash gift",
      });
    }
    if (item_choice === "item") {
      gift = await Gift.findByIdAndUpdate(
        req.user.gift_choice,
        {
          $set: {
            item,
            address,
            ...(amount && { amount }),
            ...(bank_name && { bank_name }),
            ...(account_number && { account_number }),
          },
        },
        { new: true }
      );
    } else if (item_choice === "amount") {
      gift = await Gift.findByIdAndUpdate(
        req.user.gift_choice,
        {
          $set: {
            ...(item && { item }),
            ...(address && { address }),
            amount,
            bank_name,
            account_number,
          },
        },
        { new: true }
      );
    }
    if (!gift) {
      gift = await Gift.create({
        item,
        address,
        amount,
        bank_name,
        account_number,
      });
    }
  }
  const { password, ...otherFields } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        ...otherFields,
        ...(password && password !== "" && { password }),
        gift_choice: gift ? gift._id : req.user.gift_choice,
      },
    },
    { new: true }
  )
    .populate("gift_choice")
    .select("-password");

  if (user) {
    res.render("profile", { user, success: "Profile updated successfully" });
  } else {
    res.render("profile", { user, error: "Profile could not be updated" });
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
  getUnpairedUsers,
  pairUsers,
  getUserProfile,
  updateProfile,
  deleteUser,
  logoutUser,
};
