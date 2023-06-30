const express = require('express');
const portfolioControllers = require('../controllers/portfolioControllers');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

/* 
Route: GET /user/landing
Decription: Mainpage 
*/
router.get('/portfolio', auth.authenticateSessions, portfolioControllers.portfolioDetails);

/* 
Route: GET /user/header
Decription: Mainpage 
*/
router.get('/header', auth.authenticateSessions, portfolioControllers.portfolioHeader);

/*
Route: GET /user/portfolioTrxn
PARAM: poolId
Decription: Mainpage
*/
router.get('/portfolioTrxn', auth.authenticateSessions, portfolioControllers.portfolioTrxn);

module.exports = router;
