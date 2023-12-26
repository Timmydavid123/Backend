const express = require('express');
const authController = require('../controllers/authController'); 
const passport = require('passport');
const extractUserId = require('../middleware/extractUserId');
const checkTokenExpiration = require('../middleware/checkTokenExpiration');


const router = express.Router();


router.post('/signup', authController.Signup);
router.post('/login', authController.Login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-email',  authController.verifyEmail);
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

// Apply the checkTokenExpiration middleware to every route
router.use(checkTokenExpiration);


module.exports = router;
