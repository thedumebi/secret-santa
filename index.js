require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const connectDB = require("./models");
const passportLocalMongoose = require("passport-local-mongoose");
const { cors, errorHandler, notFound } = require("./middleware");

const app = express();

// set view engine
app.set("view engine", "ejs");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session);
app.use(cors);

// static uploads folder
app.use("/uploads", express.static(__dirname + "/uploads"));

app.get("/api", (req, res) => {
  res.send("API is running ...");
});

// Routes
app.use("/", require("./routes"));

// more middlewares
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.init = () => {
  app.listen(port, () => {
    console.log(
      "\x1b[33m%s\x1b[0m",
      `Server started in ${process.env.NODE_ENV} mode on port ::${port}`
    );
  });
};

connectDB(app.init);
