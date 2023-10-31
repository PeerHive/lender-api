const database = require('../models/databases');

// Connect to the MongoDB 
// Param collectionName: string, collection name to connect the database
// Return: Client: client handler
//         Collection: array, return the collection for the collection name
async function connectToCollection(collectionName) {
    const { client, db } = await database.databaseConnection();
    const collection = db.collection(collectionName);
    return { client, collection };
}

// Calculate the months in between the start and end data
// Param startDate: string/timestamp, start date of the loan pool
// Param endDate: string/timestamp, end date of the loan pool
// Return: int, months in between
function calculateMonths(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Calculate the difference in months
    const yearsDiff = end.getFullYear() - start.getFullYear(); // Calculate the year in between 2 dates
    const monthsDiff = end.getMonth() - start.getMonth(); // Calculate the nominal month in between 2 dates
    const totalMonths = yearsDiff * 12 + monthsDiff;
  
    return totalMonths;
  }


// Initialize the Mainpage class
const Mainpage = {
    // Find the loan pool with ID
    find: async(poolId) => {
        const { client, collection } = await connectToCollection('loanPool');
        const query = {loanPoolId: poolId};
        try {
            const loanPool = await collection.findOne(query);
            if (!loanPool){
                return false;

            } else {
                return true;
                
            }
        } finally {
            client.close();
        }
    },
    
    
    // The function for header of the overview
    // Return: JSON, header with sum of pool, average interest, count number of pool (Active and Completed)
    valueLocked: async () => {
        const { client, collection } = await connectToCollection('loanPool');

        try {
            // Query with aggregation methods
            const query = [
                {
                    $match: {
                        $or: [
                            { Status: 'Open' },
                            { Status: 'Active' },
                            { Status: 'Completed' }
                        ]
                    }
                },
                {
                    $group: {
                        _id: null,
                        activeAmounts: { $sum: 
                            { 
                            $subtract: [ '$loanAmount', '$balanceAmount']
                        }
                    },
                        avgInterestRate: { $sum: 
                            { 
                            $multiply: ['$rate.lendingRate', {$sum: { $subtract: ['$loanAmount', '$balanceAmount']}}]
                        }
                    },
                        countPool: { $count: {}}
                    }
                }
            ];

            // Obtain the database of the query return in Array
            let header = await collection.aggregate(query).project({
                _id: 0
            }).toArray();
            header = header[0]
            header = {
                activeAmounts: header.activeAmounts,
                avgInterestRate: (header.avgInterestRate/header.activeAmounts),
                countPool: header.countPool
            }

            // This will find all the collection in the database
            const loanPool = await collection.find({}).project(
                { 
                    _id: 0,
                    loanAmount: 1,
                    loanPoolId: 1,
                    balanceAmount: 1,
                    rate: 1,
                    denomination: 1,
                    startDate: 1,
                    endDate: 1, 
                    Status: 1,
                    loanType: 1,
                    paymentFreq: 1,
                    repaymentStructure:1, 
                    loanName: 1 
                }
            ).toArray();

            // JSON File initialization
            mainpageList = {
                "header": header,
                "loansList": loanPool
            };
            return mainpageList ;

        } catch (error) {
            console.error('Error in aggregation:', error);

        } finally {
            // Close the MongoDB connection when done
            client.close();
        }
    },

    // The function to obtain loan pool for specific poolId
    // Param poolId: str, unique id for all the pool
    // Return: JSON, refer to below
    pool: async (poolId) => {
        const { client, collection } = await connectToCollection('loanPool');

        // JSON query of the Param
        poolId = { loanPoolId: poolId };
        try {

            // using the query from above and project to the necessary fields
            let loanPool = await collection.find(poolId).project({
                _id: 0,
                loanAmount: 1,
                loanPoolId: 1,
                balanceAmount: 1,
                rate: 1,
                denomination: 1,
                startDate: 1,
                endDate: 1, 
                Status: 1,
                borrower: 1,
                loanType: 1,
                paymentFreq: 1,
                repaymentStructure:1, 
                loanName: 1
            }).toArray();
            loanPool = loanPool[0];
            loanPool['duration'] = calculateMonths(loanPool.startDate, loanPool.endDate); // Calculation of number of months in loan pool
            
            return loanPool;

        } catch (error) {
            console.error('Error in obtaining loan data:', error);

        } finally {
            // Close the MongoDB connection when done
            await client.close();
        }
    },

    // The function to obtain repayment schedule for specific poolId
    // Param poolId: str, unique id for all the pool
    // Return: JSON, refer to below
    schedule: async (poolId) => {
        const { client, collection } = await connectToCollection('paymentSchedule');

        // JSON query of the Param
        poolId = { loanPoolId: poolId };
        try {
            
            // using the query from above and project to the necessary fields
            let schedule = await collection.find(poolId).project({
                schedule: 1,
                _id: 0
            }).toArray();
            schedule = schedule[0];

            return schedule;

        } catch (error) {
            console.error('Error in obtaining loan data:', error);

        } finally {
            // Close the MongoDB connection when done
            await client.close();
        }
    },

    // The function to obtain borrower's detail for specific borrowerId
    // Param borrowerId: str, unique id for all the borrower
    // Return: JSON, refer to below
    borrower: async (borrowerId) => {
        const { client, collection } = await connectToCollection('borrowers');
        
        // JSON query of the Param
        poolId = { borrowerId: borrowerId };
        try {
            let borrower = await collection.find(poolId).project({
                name: 1,
                placeOfIncorporation: 1,
                kyc: 1, 
                wallets: 1,
                _id: 0
            }).toArray();
            borrower = borrower[0];

            return borrower;

        } catch (error) {
            console.error('Error in obtaining loan data:', error);

        } finally {
            // Close the MongoDB connection when done
            await client.close();
        }
    }
};

module.exports = Mainpage;