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
                    const portfolios = await portfoliosLogics.Portfolio.portfolioDatas(emailId); // Get the portfolio datas of a specific user
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
            const portfolioList = await portfoliosLogics.Portfolio.find(emailId);
            if (!portfolioList) {
                res.status(404).send({ message: `email with ${emailId} not found`});
            }
            else {
                const header = await portfoliosLogics.Portfolio.overrallPortfolio(emailId); // Get the overall portfolio header for each specific user
                res.status(200).send(header);

            }
        }
    } catch (error) {
        console.error('Error in obtaining portfolio header', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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
            const transactionArray = await portfoliosLogics.Portfolio.portfolioTransaction(emailId, poolId); // Get the latest portfolio transaction for each specific user and each pool
            if (!transactionArray) {
                res.status(404).send({message: 'transaction Not Found'});
            }
            else {
                res.status(200).send(transactionArray);
            }

        }
    } catch (error) {
        console.error('Error in obtaining portfolio transaction', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const portfolioJoin = async (req, res) => {
    const userId = "lender_000001";
    const emailId = "vincent.yeo96@gmail.com";
    const walletsAddress = "1";
    const poolId = "pool_000002";
    const borrowAmount = 10;
    const { client, collection } = await portfoliosLogics.connectToCollection('loanPool');
    const loanQuery = {"loanPoolId" : poolId};
    try {
        console.log("Runing Pool Participation operations");
        const validity = await collection.find(loanQuery).toArray();
        if (!userId) {
            res.status(401).send({message: 'Session is not provided'});
        }
        if (!emailId) {
            res.status(401).send({message: 'PoolId is not provided'});
        }
        if (validity == 0) {
            res.status(400).send({message: 'Invalid poolId'});
        }
        else {
            const joinPool = await portfoliosLogics.Portfolio.portfolioParticipate(userId, walletsAddress, poolId, borrowAmount); // Get the latest portfolio transaction for each specific user and each pool
            if (!joinPool) {
                res.status(500).send({message: 'Bad Request'});
            }
            else {
                res.status(200).send(joinPool)
            }
        }
    } catch (error) {
        console.error('Error in joining portfolio', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally{
        client.close()
    }
}

module.exports = {
    portfolioDetails,
    portfolioHeader,
    portfolioTrxn,
    portfolioJoin
}