const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: String,
  filePath: String,
  base64Image: String, // Thêm trường base64Image
  uploadedAt: { type: Date, default: Date.now }
});

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
