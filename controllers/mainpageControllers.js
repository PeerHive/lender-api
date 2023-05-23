const mainopageDb = require('../models/mainpageModels');

// Main Page 
const landingAPI = async(req, res) => {
    try {
        // Extract all database lists
        const lockedList = await mainopageDb.valueLocked();
        const loanList = await mainopageDb.loans();

        // Initialized JSON data for the database lists
        const mainpageList = {
            'header': lockedList,
            'loans': loanList
        };
        res.status(201).send(mainpageList);
    
    } catch (error) {
        console.error('Error in initializing JSON data', error)
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Loan's Data
const loanDetails = async(req, res) => {
    try {
        // Obtain the parameter for the loan pool (must)
        const loanId = req.query.poolId;
        const loanPool = await mainopageDb.pool(loanId);
        const schedule = await mainopageDb.schedule(loanId);
        const completeData = {
            loanData: loanPool,
            loanSchedule: schedule
        }
        res.status(201).send(completeData);
    } catch (error) {
        console.error('Error in obtaining loan details', error)
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = {
    landingAPI,
    loanDetails
}