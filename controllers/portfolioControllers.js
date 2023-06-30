const portfoliosLogics = require('../logics/portfoliosLogics');
const authMiddleware = require('../middlewares/authMiddleware');
const authPkg = require('@clerk/clerk-sdk-node');

const { sessions, users } = authPkg;

// User portfolio details
// Return: Nil
const portfolioDetails = async(req, res) => {
    const userId = (await sessions.getSession(req.header("session"))).userId;
    const emailId = (await users.getUser(userId)).emailAddresses[0].emailAddress;
    try {    
        console.log('Running Portfolio API Operations');
        if (!userId) {
            res.status(400).send({message: 'Session is not provided'});
        }
        else {
            const portfolioList = await portfoliosLogics.find(emailId);
                if (!portfolioList) {
                    res.status(404).send({ message: `email with ${emailId} not found`});
                }
                else {
                    const portfolios = await portfoliosLogics.portfolioDatas(emailId); // Get the portfolio datas of a specific user
                    res.status(200).send(portfolios);
                }
            };

        } catch (error) {
        console.error('Error in obtaining loan details', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// User portfolio header with all the latest valuation
// Return: Nil
const portfolioHeader = async(req, res) => {
    const userId = (await sessions.getSession(req.header("session"))).userId;
    const emailId = (await users.getUser(userId)).emailAddresses[0].emailAddress;
    try {
        console.log('Running portfolio header Operations');
        if (!userId) {
            res.status(400).send({message: 'Session is not provided'});
        }
        else {
            const portfolioList = await portfoliosLogics.find(emailId);
            if (!portfolioList) {
                res.status(404).send({ message: `email with ${emailId} not found`});
            }
            else {
                const header = await portfoliosLogics.overrallPortfolio(emailId); // Get the overall portfolio header for each specific user
                res.status(200).send(header);

            }
        }
    } catch (error) {
        console.error('Error in obtaining portfolio header', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// User specific portfolio transaction
// Return: Nil
const portfolioTrxn = async(req, res) => {
    const userId = (await sessions.getSession(req.header("session"))).userId;
    const emailId = (await users.getUser(userId)).emailAddresses[0].emailAddress;
    const poolId = req.query.poolId;
    try {
        console.log("Running portfolio transaction operations");
        if (!userId) {
            res.status(400).send({message: 'Session is not provided'});
        }
        if (!poolId) {
            res.status(404).send({message: 'PoolId is not provided'});
        }
        else {
            const transactionArray = await portfoliosLogics.portfolioTransaction(emailId, poolId); // Get the latest portfolio transaction for each specific user and each pool
            if (!transactionArray) {
                res.status(404).send({message: 'transaction Not Found'});
            }
            else {
                res.status(200).send(transactionArray);
            }

        }
    } catch (error) {

    }
}

module.exports = {
    portfolioDetails,
    portfolioHeader,
    portfolioTrxn
}