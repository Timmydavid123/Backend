// models/property.js
const mongoose = require('mongoose');

const PropertyFormSchema = new mongoose.Schema({
  fullName: String,
  emailAddress: String,
  phoneNumber: String,
  propertyType: String,
  propertyAmount: String,
  propertyPictures: [String], // Assuming the file paths will be saved as strings
  propertyLocation: {
    state: String,
    country: String,
    city: String,
    address: String,
  },
  guarantor1FullName: String,
  guarantor1Email: String,
  guarantor1Phone: String,
  guarantor1Address: String,
  guarantor2FullName: String,
  guarantor2Email: String,
  guarantor2Phone: String,
  guarantor2Address: String,
  timestamp: { type: Date, default: Date.now },
});

const Property = mongoose.model('Property', PropertyFormSchema);

module.exports = PropertyFormSchema;
