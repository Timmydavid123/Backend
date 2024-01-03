const express = require('express');
const authController = require('../controllers/authController');
const passport = require('passport');
const extractUserId = require('../middleware/extractUserId');
const checkTokenExpiration = require('../middleware/checkTokenExpiration');
const Identification = require('../models/identification');
const multer = require('multer');
const Property = require('../models/property');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Set up storage configuration for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for storing uploaded files
    cb(null, 'uploads/'); // Adjust the destination folder path as needed
  },
  filename: function (req, file, cb) {
    // Generate a unique filename by appending the current timestamp to the original filename
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: storage });

router.use(checkTokenExpiration);

router.post('/signup', authController.Signup);
router.post('/login', authController.Login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);
router.get('/logout', authController.logout);
router.post('/resend-otp', authController.resendOTP);
router.get('/user', extractUserId, authController.getUser);
router.get('/users/:userId', authController.getUser);

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/');
});

router.post('/submit-property-form', upload.array('propertyPictures', 4), async (req, res) => {
  try {
    // Log file paths before moving/renaming
    console.log('Original File Paths:', req.files.map(file => file.path));

    const propertyData = req.body;
    const propertyPicturePaths = req.files.map((file) => {
      try {
        return file.path;
      } catch (fileError) {
        console.error('Error handling files:', fileError);
        res.status(500).json({ success: false, error: 'Error handling files', details: fileError.message });
      }
    });

    console.log('New File Paths:', propertyPicturePaths);

    propertyData.propertyPictures = propertyPicturePaths;
    propertyData.propertyOwnerSignature = propertyData.propertyOwnerSignature.toString();
    propertyData.guarantor1Signature = propertyData.guarantor1Signature.toString();
    propertyData.guarantor2Signature = propertyData.guarantor2Signature.toString();

    const property = new Property(propertyData);

    await property.validate();
    const savedProperty = await property.save();

    res.status(200).json({ success: true, data: savedProperty });
  } catch (error) {
    console.error('Error submitting property form:', error);
    res.status(500).json({ success: false, error: 'Failed to submit form. Please try again.', details: error.message });
  }
});

router.patch('/admin/approve-property/:propertyId', async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const newStatus = req.body.status;

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { $set: { status: newStatus } },
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    res.status(200).json({ success: true, data: updatedProperty });
  } catch (error) {
    console.error('Error updating property status:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/properties/approved', async (req, res) => {
  try {
    const approvedProperties = await Property.find({ status: 'approved' });
    res.status(200).json(approvedProperties);
  } catch (error) {
    console.error('Error fetching approved properties:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/submit-identification', async (req, res) => {
  try {
    const { propertyOwner, guarantor1, guarantor2 } = req.body;

    const propertyOwnerData = new Identification({
      role: 'Property Owner',
      idCardImage: propertyOwner.idCardImage,
      faceImage: propertyOwner.faceImage,
    });
    await propertyOwnerData.save();

    const guarantor1Data = new Identification({
      role: 'Guarantor 1',
      idCardImage: guarantor1.idCardImage,
      faceImage: guarantor1.faceImage,
    });
    await guarantor1Data.save();

    const guarantor2Data = new Identification({
      role: 'Guarantor 2',
      idCardImage: guarantor2.idCardImage,
      faceImage: guarantor2.faceImage,
    });
    await guarantor2Data.save();

    res.status(200).json({ message: 'Identification details submitted successfully!' });
  } catch (error) {
    console.error('Error handling identification submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-all-properties', (req, res) => {
  try {
    const allProperties = properties; // Replace with your actual logic to fetch all properties
    res.status(200).json(allProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/approve-property/:id', (req, res) => {
  try {
    const propertyId = req.params.id;
    const propertyIndex = properties.findIndex((property) => property.id === propertyId);

    if (propertyIndex !== -1) {
      properties[propertyIndex].status = 'approved';
      res.status(200).json({ message: 'Property approved successfully' });
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
