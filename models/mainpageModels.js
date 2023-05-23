const database = require('./databases');

// Mainpage Model Methods

async function mainpageConnect() {
    const { client, db } = await database.databaseConnection();
    try {
        const collection = db.collection('loanPool');
        return {client, collection};
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}

async function scheduleConnect() {
    const { client, db } = await database.databaseConnection();
    try {
        const collection = db.collection('paymentSchedule');
        return {client, collection};
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}

const Mainpage = {
    // Function to obtain total active loan amount
    valueLocked: async() => {
        const { client, collection } = await mainpageConnect();
        try {
            const query = [
                { $match: { 
                  $or: [
                    {Status: 'Active'}, 
                    {Status: 'Completed'}
                  ]
                }
              },
                { $group: {
                    _id: null,
                    activeAmounts: {$sum: '$loanAmount'},
                    AvginterestRate: {$avg: '$interestRate.interestRate'}
                }
            }
            ];
            let header = await collection.aggregate(query).toArray();
            return header[0];
        } catch (error) {
            console.error('Error in aggregation:', error);
        } finally {
            client.close();
        }
    },
    
    // obtain all the loans in the database
    loans: async() => {
        const { client, collection } = await mainpageConnect();
        try {
            const loanList = await collection.find().toArray()
            return loanList
        } catch (error) {
            console.error('Error in loans listing:', error)
        } finally {
            client.close();
        }
    },

    // Get the loan's data
    pool: async(poolId) => {
        const { client, collection } = await mainpageConnect();
        poolId = {loanPoolId: poolId}
        try {
            dateQuery = [
                { $match: poolId},
                { $project: {
                    duration: {
                        $dateDiff: {
                            startDate: "$startDate",
                            endDate: "$endDate",
                            unit: "month"
                        }
                    }
                }}
            ];
            let loanPool = await collection.find(poolId).toArray();
            loanPool = loanPool[0];
            delete loanPool['approval'];
            delete loanPool['creator'];
            return loanPool
        } 
        catch (error) {
            console.error('Error in obtaining loan datas:', error)
        }
        finally {
            // close the MongoDB connection when done
            await client.close();
        }
    },

    schedule: async(poolId) => {
        const {client, collection} = await scheduleConnect();
        poolId = {loanPoolId: poolId}
        try {
            let schedule = await collection.find(poolId).toArray();
            schedule = schedule[0]
            delete schedule['loanPoolId'];
            return schedule
        } catch (error) {
            console.error('Error in obtaining loan datas:', error)
        }
        finally {
            // close the MongoDB connection when done
            await client.close();
        }
    }
}

module.exports = Mainpage ;