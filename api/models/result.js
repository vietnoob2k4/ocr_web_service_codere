const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  ocrText: String,
  language: String,
  userId:{type:mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
  createdAt: { type: Date, default: Date.now }
});
const Result = mongoose.model("Result", resultSchema);

module.exports =  Result;

