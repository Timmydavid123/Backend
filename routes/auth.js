const express = require('express');
const authController = require('../controllers/authController'); 
const passport = require('passport');
const extractUserId = require('../middleware/extractUserId');
const checkTokenExpiration = require('../middleware/checkTokenExpiration');
const submitPropertyForm = require('../controllers/propertyController');
const Identification = require('../models/identification');


const router = express.Router();


router.post('/signup', authController.Signup);
router.post('/login', authController.Login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);
router.get('/logout', authController.logout);
router.post('/resend-otp', authController.resendOTP);
router.get('/user', extractUserId, authController.getUser);
router.get('/users/:userId', authController.getUser);


router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to a success page or send a response
    res.redirect('/');
  }
);

router.post('/submit-property-form',extractUserId, submitPropertyForm.submitPropertyForm);

// Apply the checkTokenExpiration middleware to every route
router.use(checkTokenExpiration);

// Handle identification submission
router.post('/submit-identification', async (req, res) => {
  try {
    const { propertyOwner, guarantor1, guarantor2 } = req.body;

    // Save identification data to the database using Mongoose model
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

module.exports = router;
