const mainopageDb = require('../logics/landingLogics');

// Main Page 
// return: nil
const landingAPI = async(req, res) => {
    try {

        console.log('Running Landing API Operations')
        // Extract all database lists
        const mainPageList = await mainopageDb.valueLocked(); // Get the header of JSON file

        res.status(201).send(mainPageList);
    
    } catch (error) {
        console.error('Error in initializing JSON data', error)
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Loan's Data
// return: nil
const loanDetails = async(req, res) => {
    try {

        console.log('Running Loan Details Operations')
        // Obtain the parameter for the loan pool (must)
        const loanId = req.query.poolId;
        const loanPool = await mainopageDb.pool(loanId); // Get the loan pool of a specific loanId
        const schedule = await mainopageDb.schedule(loanId); // Get the loan schedule of a specific loanId
        const borrower = await mainopageDb.borrower(loanPool.borrower); // Get the borrower's detail based on the borrower detail
        const completeData = {
            loanData: loanPool,
            loanSchedule: schedule
        }
        completeData.loanData.borrower = borrower;
        
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