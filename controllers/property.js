// controllers/property.js
const Property = require('../models/property'); // Check the correct path to your model

const submitPropertyForm = async (req, res) => {
  try {
    // Assuming req.body contains the submitted form data
    const propertyData = req.body;

    // Create an instance of the Property model
    const property = new Property(propertyData);

    // Validate the data against the Mongoose schema
    await property.validate();

    // Save the property data if validation passes
    const savedProperty = await property.save();

    res.status(200).json({ success: true, data: savedProperty });
  } catch (error) {
    console.error('Error submitting property form:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { submitPropertyForm };
