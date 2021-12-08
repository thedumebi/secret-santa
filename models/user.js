const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
    },
    gift_choice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
    },
    first_name: String,
    last_name: String,
    address: String,
    phone_number: String,
    is_admin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getFullName = function () {
  return [this.first_name, this.last_name].join(" ");
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre("findOneAndUpdate", async function () {
  if (this._update.$set && this._update.$set.password) {
    const salt = await bcrypt.genSalt();
    this._update.$set.password = await bcrypt.hash(
      this._update.$set.password,
      salt
    );
  }
});

const User = mongoose.model("User", userSchema);

const authenticateUser = async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: "Incorrect email or password" });
    }
    if (await user.matchPassword(password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Incorrect password or email" });
    }
  } catch (err) {
    return done(err);
  }
};

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    authenticateUser
  )
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

module.exports = User;
