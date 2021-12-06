const mongoose = require("mongoose");

const connectDB = async (callback) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    });
    mongoose.set("returnOriginal", false);
    console.log("\x1b[33m%s\x1b[0m", "Database connection established");

    callback()
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", `Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
