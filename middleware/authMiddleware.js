// middleware/authMiddleware.js

const express = require('express');
const router = express.Router();

const authenticateAdmin = (req, res, next) => {
  const { username, password } = req.body;

  // Replace these values with your desired username and password
  const correctUsername = 'ZiltInvestment';
  const correctPassword = '1234567890';

  if (username === correctUsername && password === correctPassword) {
    // Authentication successful
    next();
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
};

module.exports = authenticateAdmin;
