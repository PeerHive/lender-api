const express = require('express');
const portfolioControllers = require('../controllers/portfolioControllers');
const userControllers = require('../controllers/userControllers');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/test', auth.checkUserandUpdate, (req,res)=>{
    res.send({status: 'Hello World, welcome to PeerHive app'});
});

/* 
Route: GET /user/landing
Decription: get the entire portfolio of the user 
*/
router.get('/portfolio', auth.authenticateSessions, portfolioControllers.portfolioDetails);

// Route to find user by ID or email
router.get('/finduser', auth.authenticateSessions, userControllers.userDetails);

// Route to update user by ID or email
router.patch('/updateuser', auth.authenticateSessions, userControllers.updateUser);

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
Route: POST /user/joinPool
Query: poolId
Query: Amount
Decription: to join a pool in the loanPool
*/
router.post('/joinPool', auth.authenticateSessions, portfolioControllers.portfolioJoin)

module.exports = router;
