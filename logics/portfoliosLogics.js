const { connect } = require('mongo');
const moment = require('moment')
const CoinGecko = require('coingecko-api');
const _ = require('underscore');

const database = require('../models/databases');
const User = require('../models/portfolioModels');

const coinGeckoClient = new CoinGecko(); 

/*
 Connect to the MongoDB 
 Param collectionName: string, collection name to connect the database
 Return: Client: client handler
         Collection: array, return the collection for the collection name
*/
async function connectToCollection(collectionName) {
    const { client, db } = await database.databaseConnection();
    const collection = db.collection(collectionName);
    return {client, collection};
}

/*
 Connect to the MongoDB 
 Param tickers: string, collection name for a specific crypto ticker. Ex: USDT, USDC, DAI, USDA
 Return Param: ARRAY of ticker and their latest price 
*/
async function price(tickers) {
    const { client, collection } = await connectToCollection('coingeckoParam');
    try {
        queryParam = {symbol: {$in: tickers}, usage: true}
        const param = await collection.find(queryParam).project({
            _id: 0,
            id: 1,
            symbol: 1
        }).toArray();

        // Initialized Denomination list for each ticker from DB
        const denomination = [];
        for (ticker of param) {
            denomination.push(ticker.id);
            ticker.price = null;
        };
        
        // Get the latest latest price from CoinGeckoClient
        let latestPrice = await coinGeckoClient.simple.price({
            ids: denomination,
            vs_currencies: ['usd']
        });

        // Parse the latest price from CoinGeckoClient api to param
        const prices = latestPrice.data;
        for (const obj of param) {
            const {id} = obj;
            if (prices[id] && prices[id].usd) {
                obj.price = prices[id].usd;
            }
        }
        return param

    } catch (error) {
        console.log('Error in obtaining latest price:', error );

    } finally {
        client.close();
    }
};

// Initialized the Portfolio Class
const Portfolio = {
    // Find the loan pool with ID
    find: async(emailId) => {
        const { client, collection } = await connectToCollection('lenders');
        const query = {email: emailId};
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
        
    /* 
    Get all the portfolio of a specific user
    Param email: string, unique email of each user
    Return portfolioId: JSON
    */
    getPortfolio: async (email) => {
        const { client, collection } = await connectToCollection('lenders');
        const emailQuery = { email: email};
        try {
            const portfolioId = await collection.find(emailQuery).project (
                {
                    _id: 0,
                    email: 1,
                    portfolio: 1
                }
            ).toArray();
            return portfolioId;

        } catch (error) {
            console.log('Error in obtaining portfolio:', error );

        } finally {
            client.close();
        }
    },

    /* 
    Get the details of a portfolio from Loan Pool table
    Param portfolioId: string, unique for each loan pool
    Return details: JSON
    */
    portfolioDetails: async (portfolioId) => {
        const { client, collection } = await connectToCollection('loanPool');
        try {
            // Find the collection for the portfolioId
            var details = await collection.find({ loanPoolId: portfolioId}).project (
                {
                    _id: 0,
                    interestRate: 1,
                    denomination: 1,
                    Status: 1,
                    paymentFreq: 1,
                    repaymentStructure:1,
                    loanName: 1,
                    loanAmount: 1,
                    rate: 1
                }
            ).toArray();
            return details

        } catch (error) {
            console.error('Error in obtaining portfolio datas:', error);

        } finally {
            client.close();
        }
    },

    /* 
    Get all the portfolio of a specific user and compress portfolio details
    Param email: string, unique email of each user
    Return portfolioList: JSON
    */
    portfolioDatas: async (email) => {
        const getPortfolios = await Portfolio.getPortfolio(email);
        const denomination = []
        try {
            for(
                // Loop through each portfolio
                var portfolio of getPortfolios[0].portfolio) {
                var details = await Portfolio.portfolioDetails(portfolio.loanPoolId);
                details = details[0];
                console.log(details)
                // Calculate the net rate received by lender
                details.netRate = (details.rate.lendingRate - details.rate.interestRate).toFixed(3);
                denomination.push(details.denomination.toLowerCase());
                delete details.interestRate;
                delete portfolio.joinedAt;
                portfolio.details = details;
            };
            const priceList = await price(denomination);

            // Puch portfolio to portflioList as return and multiply with filtered price
            portfolioList = getPortfolios[0].portfolio;
            for (detail of portfolioList) {
                const filteredPrice = _.where(priceList, {symbol: detail.details.denomination.toLowerCase()});
                detail.value = detail.amount * filteredPrice[0].price
            };

            return portfolioList

        } catch (error) {
            console.error('Error in obtaining portfolio datas:', error);

        }
    },

    /* 
    Get all the portfolio of a specific user and compute the latest value for each loan pool
    Param email: string, unique email of each user
    Return portfolioHeader: JSON
    */
    overrallPortfolio: async (email) => {
        const portfolioList = await Portfolio.portfolioDatas(email);
        let totalValue = 0;
        let averageInterest = 0;

        // To calculate the latest valuation of each loan pool with each specific ticker
        try { 
            for (const obj of portfolioList) {
                totalValue += obj.value;
            };
            for ( const obj of portfolioList ) {
                var percentage = obj.value / totalValue;
                averageInterest += obj.details.netRate * percentage;
            };
            const portfolioHeader = {
                overallValue: totalValue,
                avgRate: averageInterest,
                portfolio: portfolioList
            }
            return portfolioHeader;

        } catch (error) {
            console.error('Error in overall calculation:', error);

        } 
    },

    /* 
    Get all specific portfolio transaction history for a user 
    Param email: string, unique email of each user
    Param poolId: string, unique portfolio for each pool
    Return investment: JSON
    */
    portfolioTransaction: async (email, poolId) => {
        const now = Date.now();
        console.log(email)
        const getPortfolios = await Portfolio.getPortfolio(email);
        console.log(getPortfolios)
        const portfolioList = getPortfolios[0].portfolio;
        const output = portfolioList.filter(portfolio => portfolio.loanPoolId === poolId);
        const poolDetails = await Portfolio.portfolioDetails(poolId);
        const loanAmount = output[0].amount
        const investPortion = loanAmount / poolDetails[0].loanAmount;
        const { client, collection } = await connectToCollection('paymentSchedule');
        const paymentArray = [];
        var earnedInterest = 0;
        var status = "On-Time"; // Default transaction status as On-Time
        try {
            var details = await collection.find({ loanPoolId: poolId}).toArray();
            const schedule = details[0].schedule;
            for (num in schedule) {
                scheduleStatus = schedule[num].status;

                // Identify each of the special transaction status such as paid, late and defaulted
                if ((Date.now() >= schedule[num].repaymentDate) && scheduleStatus === "paid") {
                    earnedInterest += (schedule[num].interestPayment) * investPortion
                };

                if (scheduleStatus === 'late') {
                    status = "Late"
                };

                if (scheduleStatus === "defaulted") {
                    status = "Defaulted"
                };

                // Initialized payment set and push to payment array
                var paymentSet = {
                        'repaymentDate': schedule[num].repaymentDate,
                        'status': scheduleStatus,
                        'interestPayment': ((schedule[num].interestPayment) * investPortion).toFixed(3),
                        'principalPayment': ((schedule[num].principalPayment) * investPortion).toFixed(3)
                    };
                    
                paymentArray.push(paymentSet)
                };
            
            // Initialized JSON with payment array and headers
            const investments = {
                investedAmount: loanAmount,
                paidInterest: earnedInterest,
                loanStatus: status,
                transactions : paymentArray
            }
            return investments

        } catch (error) {
            console.error('Error in overall calculation:', error);

        } finally {
            client.close()
        }
    },
}


module.exports = {
    connectToCollection, 
    Portfolio
}
