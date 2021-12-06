const mongoose = require("mongoose");

const giftSchema = new mongoose.Schema(
  {
    item: String,
    amount: Number,
    status: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Gift = mongoose.model("Gift", giftSchema);

module.exports = Gift;
