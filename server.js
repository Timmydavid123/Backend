// Import the necessary modules
require('dotenv').config();
const crypto = require('crypto');
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const extractUserId = require('./middleware/extractUserId');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); 
const path = require('path');
const cookieParser = require('cookie-parser');
const adminRoutes = require('./routes/admin');
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

  // Serve the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle 404 errors
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', '404.html'));
});
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Define corsOptions before using it
const corsOptions = {
  origin: ['http://localhost:3000', 'https://flexile.vercel.app', 'https://flexileinvestment.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: 'Content-Type, Authorization',
};
// Use the CORS middleware for all routes
    app.use(cors(corsOptions));

if (req.method === 'OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', 'https://flexileinvestment.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204); // No content for preflight requests
  return;
}

// Using helmet middleware for secure headers
app.use(helmet());
app.use(helmet.contentSecurityPolicy(/* your CSP configuration */));

// Initialize Passport and use the express-session middleware with the generated secret key
app.use(session({ secret: sessionSecretKey, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use((err, req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
  } else {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  }
});
// Using helmet middleware for secure headers
app.use(helmet());
app.use(helmet.contentSecurityPolicy(/* your CSP configuration */));
// Initialize Passport and use the express-session middleware with the generated secret key
app.use(session({ secret: sessionSecretKey, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', authRoutes);
app.use('/admin', adminRoutes);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
