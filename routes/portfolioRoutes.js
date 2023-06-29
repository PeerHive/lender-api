const express = require('express');
const portfolioControllers = require('../controllers/portfolioControllers');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

// Route: GET/landing
// Decription: Mainpage 
router.get('/portfolio', auth.authenticateSessions, portfolioControllers.portfolioDetails);

router.get('/header', auth.authenticateSessions, portfolioControllers.portfolioHeader);

module.exports = router;
