  const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  propertyType: { type: String, required: true },
  propertyAmount: { type: String, required: true },
  propertyPicture: { type: String }, // or { type: Buffer } depending on your use case
  propertyLocation: {
    state: { type: String},
    city: { type: String},
    lga: { type: String},
  },
  propertyaddress: { type: String},
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'disapproved'],
    default: 'pending',
  },
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
