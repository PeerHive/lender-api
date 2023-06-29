const { connect } = require('mongo');
const database = require('../models/databases');
const CoinGecko = require('coingecko-api');
const _ = require('underscore');

const coinGeckoClient = new CoinGecko(); 


async function connectToCollection(collectionName) {
    const { client, db } = await database.databaseConnection();
    const collection = db.collection(collectionName);
    return {client, collection};
}

async function price(tickers) {
    const { client, collection } = await connectToCollection('coingeckoParam');
    try {
        queryParam = {symbol: {$in: tickers}, usage: true}
        const param = await collection.find(queryParam).project({
            _id: 0,
            id: 1,
            symbol: 1
        }).toArray();
        const denomination = [];
        for (ticker of param) {
            denomination.push(ticker.id);
            ticker.price = null;
        };
        let latestPrice = await coinGeckoClient.simple.price({
            ids: denomination,
            vs_currencies: ['usd']
        });
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
}

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

    portfolioDetails: async (portfolioId) => {
        const { client, collection } = await connectToCollection('loanPool');
        try {
            var details = await collection.find({ loanPoolId: portfolioId}).project (
                {
                    _id: 0,
                    interestRate: 1,
                    denomination: 1,
                    Status: 1,
                    paymentFreq: 1,
                    repaymentStructure:1,
                    loanName: 1
                }
            ).toArray();
            return details

        } catch (error) {
            console.error('Error in obtaining portfolio datas:', error);

        } finally {
            client.close();
        }
    },

    portfolioDatas: async (email) => {
        const getPortfolios = await Portfolio.getPortfolio(email);
        const denomination = []
        try {
            for( var portfolio of getPortfolios[0].portfolio) {
                var details = await Portfolio.portfolioDetails(portfolio.loanPoolId)
                details = details[0];
                details.netRate = (details.interestRate.lendingRate - details.interestRate.interestRate).toFixed(3);
                denomination.push(details.denomination.toLowerCase());
                delete details.interestRate;
                delete portfolio.joinedAt;
                portfolio.details = details;
            };
            const priceList = await price(denomination)
            portfolioList = getPortfolios[0].portfolio
            for (detail of portfolioList) {
                const filteredPrice = _.where(priceList, {symbol: detail.details.denomination.toLowerCase()})
                detail.value = detail.amount * filteredPrice[0].price
            }
            return portfolioList

        } catch (error) {
            console.error('Error in obtaining portfolio datas:', error);

        }
    },

    overrallPortfolio: async (email) => {
        const portfolioList = await Portfolio.portfolioDatas(email);
        let totalValue = 0;
        let averageInterest = 0;
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
            return portfolioHeader

        } catch (error) {
            console.error('Error in overall calculation:', error);

        } 
    }
}


module.exports = Portfolio
