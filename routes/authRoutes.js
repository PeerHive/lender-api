const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authControllers')

const router = express.Router();

// Route: POST /signup
// Description: User registration
router.post('/signup', authController.registerUser);

// Route: POST /login
// Description: User login
router.post('/login', authController.loginUser);

module.exports = router;