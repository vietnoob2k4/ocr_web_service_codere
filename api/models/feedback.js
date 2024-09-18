const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:{ type:String , required: true},
  uploadedAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
