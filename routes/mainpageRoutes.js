const express = require('express');
const database = require('../models/databases');
const mainpageController = require('../controllers/mainpageControllers')

const router = express.Router();

// Route: GET/landing
// Decription: Mainpage 
router.get('/landing', mainpageController.landingAPI);

// Route: GET/pool
// PARAM: poolId
// Description: Specific loan pool details
router.get('/pool', mainpageController.loanDetails);

module.exports = router;