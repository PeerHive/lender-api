const express = require('express');
const portfolioControllers = require('../controllers/portfolioControllers');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

/* 
Route: GET /user/landing
Decription: get the entire portfolio of the user 
*/
router.get('/portfolio', auth.authenticateSessions, portfolioControllers.portfolioDetails);

/* 
Route: GET /user/header
Decription: retrieve all the portfolio of the user with header (Front Page) 
*/
router.get('/header', auth.authenticateSessions, portfolioControllers.portfolioHeader);

/*
Route: GET /user/pool
Query: poolId
Decription: Get the specific portfolio potential return and transaction deadline
*/
router.get('/pool', auth.authenticateSessions, portfolioControllers.portfolioTrxn);


/*
Route: POST /user/portfolioTrxn
Query: poolId
Query: Amount
Decription: to join a pool in the loanPool
*/
router.post('/joinPool', auth.authenticateSessions, portfolioControllers.portfolioJoin)

module.exports = router;
