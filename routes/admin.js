const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Property = require('../models/property');


// Hardcoded username and password
const hardcodedUsername = 'Flexile1234';
const hardcodedPassword = '1234567890';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the provided username and password match the hardcoded values
    if (username === hardcodedUsername && password === hardcodedPassword) {
      // Authentication successful
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


  
module.exports = router;