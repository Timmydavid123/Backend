// identification.js (Mongoose Model)
const mongoose = require('mongoose');

const identificationSchema = new mongoose.Schema({
  role: { type: String, required: true },
  idCardImage: { type: String, required: true },
  faceImage: { type: String, required: true },
});

const Identification = mongoose.model('Identification', identificationSchema);

module.exports = Identification;
