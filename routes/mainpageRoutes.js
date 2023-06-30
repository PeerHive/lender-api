const express = require('express');
const database = require('../models/databases');
const mainpageController = require('../controllers/mainpageControllers')

const router = express.Router();

/* 
Route: GET/main/overview
Decription: Mainpage 
*/
router.get('/overview', mainpageController.landingAPI);

/*
Route: GET/main/pool
PARAM: poolId
Description: Specific loan pool details
*/
router.get('/pool', mainpageController.loanDetails);

module.exports = router;