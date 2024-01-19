const portfoliosLogics = require('../logics/portfoliosLogics');
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
            const portfolioList = await portfoliosLogics.Portfolio.find(emailId);
                if (!portfolioList) {
                    res.status(404).JSON({ message: `email with ${emailId} not found`});
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
            res.status(400).send({message: 'PoolId is not provided'});
        }
        else {
            // Get the latest portfolio transaction for each specific user and each pool
            const transactionArray = await portfoliosLogics.Portfolio.portfolioTransaction(emailId, poolId); 
            if (!transactionArray) {
                res.status(404).send({message: 'transaction Not Found'});
            }
            else if (transactionArray === "Invalid" ) {
                res.status(404).send({message: 'Not Invested in this pool'})
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

// API Endpoint for user to join the pool
// Return: Nil
const portfolioJoin = async (req, res) => {

    // Getting the specific of the loanPool
    const { client, collection } = await portfoliosLogics.connectToCollection('loanPool');

    // Using the sessionId of the user to obtain the email
    const userId = (await sessions.getSession(req.header("session"))).userId;
    const emailId = (await users.getUser(userId)).emailAddresses[0].emailAddress;

    // retrieve poolId and the total amount to be loaned
    const poolId = req.query.poolId;
    const borrowAmount = req.query.amount;
    const loanQuery = {"loanPoolId" : poolId};

    try {
        console.log("Runing Pool Participation operations");
        
        // Check for the array of the loanPool
        const validity = await collection.find(loanQuery).toArray();
        const loanAmount = validity[0].balanceAmount;
        if (validity[0].Status !== "Open") {
            res.status(401).json({message: 'Loan Pool is not fund raising'})
        }
        else if (!userId) {
            res.status(401).json({message: 'Session is not provided'});
        }
        else if (!poolId) {
            res.status(401).json({message: 'PoolId is not provided'});
        }
        else if (!emailId) {
            res.status(401).json({message: 'emailId is not provided'});
        }
        else if (validity == 0) {
            res.status(400).json({message: 'Invalid poolId'});
        }
        else if (borrowAmount > loanAmount) {
            res.status(401).json({message: 'Loan Amount Exceed Alloted Amount'})
        }
        else {
            // Retrieve the status of joining the pool
            portfoliosLogics.Portfolio.portfolioParticipate(emailId, poolId, borrowAmount, loanAmount).then(
                pool => {
                    if (!pool) {
                        res.status(500).json({message: 'Bad Request'});
                    }
                    else {
                        res.status(200).json(pool)
                    }
                }
            ); // Get the latest portfolio transaction for each specific user and each pool
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