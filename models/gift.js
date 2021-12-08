const mongoose = require("mongoose");

const giftSchema = new mongoose.Schema(
  {
    item: String,
    address: String,
    amount: Number,
    bank_name: String,
    account_number: String,
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
