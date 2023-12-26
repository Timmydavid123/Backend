const sendEmail = require('../utils/sendEmail');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const passport = require('passport'); // Add this line to include passport
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ googleId: profile.id });

    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
    });

    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));


const authController = {
  Signup: async (req, res) => {
    try {
      const { fullName, email, password } = req.body;
  

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }
  
      const newUser = await User.create({
        fullName,
        email,
        password,
      });
  
      // Generate a new 4-digit OTP
      const newOTP = otpGenerator.generate(4, { upperCase: false, specialChars: false });
  
      newUser.emailVerificationOTP = newOTP;
      await newUser.save();
  
      // Send the OTP to the user's email
      const emailText = `Your OTP for email verification is: ${newOTP}`;
      await sendEmail(email, 'Email Verification OTP', emailText);
  
      // Set a cookie in the response
      const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, maxAge: 86400000 }); // Max age is set to 1 day in milliseconds
  
      res.status(201).json({ message: 'User signup successful. Email verification OTP sent.' });
    } catch (error) {
      console.error('Error during user signup:', error);
      res.status(500)``.json({ message: 'Internal Server Error during user signup', error: error.message });
    }
  },
  Login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find the regular user
      const user = await User.findOne({ email });

      // Check if the regular user is found
      if (user) {
        // Check if the user is verified
        if (!user.isVerified) {
          return res.status(401).json({ message: 'Email not verified. Please verify your email.' });
        }

        // Check the password
        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
          return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate a JWT token with expiration time set to 1 day
        const token = user.generateAuthToken();

        // Send the token in the response
        res.json({ token, message: 'Login successful' });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error during user login:', error);
      res.status(500).json({ message: 'Internal Server Error during user login' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.userId; // Extracted from the JWT token using extractUserId middleware
      console.log('User ID:', userId);

      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Extract updated profile information from the request body
      const { email, password, fullName } = req.body;

      // Update the user's profile information
      user.email = email || user.email;
      if (password) {
        // If a new password is provided, hash and update it
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
      user.fullName = fullName || user.fullName;

      // Save the updated user object
      await user.save();

      res.json({ message: 'User profile updated successfully' });
    } catch (error) {
      console.error('Error during user profile update:', error);
      res.status(500).json({ message: 'Internal Server Error during user profile update' });
    }
  },

  logout: (req, res) => {
    try {
      req.logout(); // Assuming you're using passport
      res.clearCookie('token'); // Clear the token cookie
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ message: 'Internal Server Error during logout' });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const userId = req.userId; // Extracted from the JWT token using extractUserId middleware
      console.log('User ID:', userId);

      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if the user is already verified
      if (user.isVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
      }

      // Check if the provided OTP matches the stored OTP
      const { otp } = req.body;
      if (otp === user.emailVerificationOTP) {
        // Mark the user as verified
        user.isVerified = true;
        // Clear the stored OTP
        user.emailVerificationOTP = undefined;
        await user.save();

        res.json({ message: 'Email verification successful' });
      } else {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error during email verification:', error);
      res.status(500).json({ message: 'Internal Server Error during email verification' });
    }
  },
// Route for user forgotPassword
forgotPassword: async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a password reset token 
    const passwordResetToken = uuid.v4();

    // Save the password reset token and its expiration time in the user document
    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

    await user.save();

    // Send the password reset email with the token link
    const resetLink = `http://localhost:3000/Resetpassword?token=${passwordResetToken}`;
    const emailText = `Click on the following link to reset your password: ${resetLink}`;
    await sendEmail(email, 'Password Reset', emailText);

    res.status(200).json({ message: 'Password reset instructions sent. Check your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
},
  resendOTP: async (req, res) => {
    try {
      const userId = req.userId; // Extracted from the JWT token using extractUserId middleware
      console.log('User ID:', userId);

      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate a new 4-digit OTP
      const newOTP = otpGenerator.generate(4, { upperCase: false, specialChars: false });

      // Save the new OTP in the user document
      user.emailVerificationOTP = newOTP;
      await user.save();

      // Send the new OTP to the user's email
      const emailText = `Your new OTP for email verification is: ${newOTP}`;
      await sendEmail(user.email, 'Email Verification OTP', emailText);

      res.json({ message: 'New OTP sent successfully' });
    } catch (error) {
      console.error('Error during OTP resend:', error);
      res.status(500).json({ message: 'Internal Server Error during OTP resend' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;
  
      // Find the user by the password reset token
      const user = await User.findOne({ passwordResetToken: token });
  
      // Check if the token is valid and not expired
      if (!user || (user.passwordResetTokenExpiration && user.passwordResetTokenExpiration < Date.now())) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
  
      // Check if passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password and clear the reset token fields
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpiration = undefined;
      await user.save();
  
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  getUser: async (req, res) => {
    try {
      const userId = req.userId; // Extracted from the JWT token using extractUserId middleware
      console.log('User ID:', userId);

      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user information (excluding sensitive information like password)
      res.json({
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
      });
    } catch (error) {
      console.error('Error during get user:', error);
      res.status(500).json({ message: 'Internal Server Error during get user' });
    }
  },

  // ... (other functions)
};

module.exports = authController;
