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
const extractUserId = require('./middleware/extractUserId');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Property = require('./models/property'); // Import the Property model

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

app.use(express.urlencoded({ extended: false }));

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: 'Content-Type, Authorization',
};

// Handle preflight requests
app.options('*', cors(corsOptions));

// Use the CORS middleware for all routes
app.use(cors(corsOptions));

// Add the Cross-Origin-Opener-Policy header here
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});


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


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/property'); // Adjust the destination folder as needed
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Configure nodemailer with your email service provider details
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Property form submission route with file upload
app.post('/submit-property-form', upload.array('propertyPictures', 5), async (req, res) => {
  const formData = req.body;
  formData.propertyPictures = req.files.map((file) => file.path); // Save file paths to propertyPictures

  // Save form data to MongoDB
  try {
    const savedForm = await Property.create(formData);

    // Send an email to the provided email address
    await sendConfirmationEmail(formData.emailAddress);

    console.log('Form submitted and saved to the database:', savedForm);
    res.json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error saving form data to the database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to send a confirmation email
async function sendConfirmationEmail(emailAddress) {
  const mailOptions = {
    from: 'adeleketimileyin11@gmail.com',
    to: emailAddress,
    subject: 'Property Form Submission Received',
    text: 'Thank you for submitting the property form. Your submission is being processed for review. We will get back to you shortly.',
  };

  // Use nodemailer to send the email
  await transporter.sendMail(mailOptions);
}
