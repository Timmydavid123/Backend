// Import the necessary modules
require('dotenv').config();
const crypto = require('crypto');
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const extractUserId = require('./middleware/extractUserId')

// Generate a secure random string as the session secret key
const randomBuffer = crypto.randomBytes(32);
const sessionSecretKey = randomBuffer.toString('hex');

const app = express();
const PORT = process.env.PORT || 4000;

const { MONGODB_URI } = process.env;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });


// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Using helmet middleware for secure headers
app.use(helmet());

// Initialize Passport and use the express-session middleware with the generated secret key
app.use(session({ secret: sessionSecretKey, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
