// models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  propertyType: { type: String, required: true },
  propertyAmount: { type: String, required: true },
  propertyPictures: [{ type: String }], // Assuming you store image URLs
  propertyLocation: {
    state: { type: String, required: true },
    city: { type: String, required: true },
    lga: { type: String, required: true },
    address: { type: String, required: true },
  },
  propertyCountry: { type: String, required: true },
  guarantor1FullName: { type: String, required: true },
  guarantor1Email: { type: String, required: true },
  guarantor1Phone: { type: String, required: true },
  guarantor1Address: { type: String, required: true },
  guarantor2FullName: { type: String, required: true },
  guarantor2Email: { type: String, required: true },
  guarantor2Phone: { type: String, required: true },
  guarantor2Address: { type: String, required: true },
  propertyOwnerSignature: { type: String, required: true },
  guarantor1Signature: { type: String, required: true },
  guarantor2Signature: { type: String, required: true },
  propertyOwnerThumb: { type: String, required: true },
  guarantor1Thumb: { type: String, required: true },
  guarantor2Thumb: { type: String, required: true },
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;