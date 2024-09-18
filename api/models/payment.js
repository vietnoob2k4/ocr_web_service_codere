const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: String,
  subscriptionType: String,
  status: { type: String, enum: ["successful", "failed"] },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;

