const portfoliosLogics = require('../logics/portfoliosLogics');
const authMiddleware = require('../middlewares/authMiddleware');


const portfolioDetails = async(req, res) => {
    try {
        
        console.log('Running Portfolio API Operations');
        const emailId = "Ali@peerhive.app"
        const portfolioList = await portfoliosLogics.find(emailId);
            if (!portfolioList) {
                res.status(404).send({ message: `email with ${emailId} not found`});
            }
            else {
                const portfolios = await portfoliosLogics.portfolioDatas(emailId);
                res.status(200).send(portfolios);
            }
        }
         catch (error) {
        console.error('Error in obtaining loan details', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const portfolioHeader = async(req, res) => {
    try {
        
        console.log('Running portfolio header Operations');
        const emailId = req.query.email;
        if (!emailId) {
            res.status(400).send({message: 'Email is not provided'});
        }
        else {
            const portfolioList = await portfoliosLogics.find(emailId);
            if (!portfolioList) {
                res.status(404).send({ message: `email with ${emailId} not found`});
            }
            else {
                const header = await portfoliosLogics.overrallPortfolio(emailId);
                res.status(200).send(header);

            }
        }
    } catch (error) {
        console.error('Error in obtaining portfolio header', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    portfolioDetails,
    portfolioHeader
}