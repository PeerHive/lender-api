const web3 = require("web3")

const baseAccountModule = "https://api-testnet.polygonscan.com/api?module=logs";
const PSapiKey = process.env.POLYGONSCAN;

const comparisonJL = web3.utils.stringToHex("Joined Loan").substring(2).padEnd(64,0);
const comparisonLC = web3.utils.stringToHex("Loan Created").substring(2).padEnd(64,0);
const comparisonCD = web3.utils.stringToHex("Capital Drawn").substring(2).padEnd(64,0);
const comparisonLR = web3.utils.stringToHex("Loan Repaid").substring(2).padEnd(64,0);
const comparisonWD = web3.utils.stringToHex("Withdraw").substring(2).padEnd(64,0);
const comparisonTR = web3.utils.stringToHex("Transfer").substring(2).padEnd(64,0);


function insertNewlines(string, every = 64) {
    const lines = [];
    for (let i = 0; i < string.length; i += every) {
        lines.push(string.slice(i, i + every));
    }
    return lines;
}

const logs = {
    getContracts: async (address) => {
        const fullAddress = baseAccountModule + `&action=getLogs&fromBlock=0&toBlock=99999999&address=${address}&startblock=0&endblock=99999999&apikey=${PSapiKey}`;
        try {
            const contractTransaction = await fetch(fullAddress);
            const transactionData = await contractTransaction.json();
            const results = transactionData.result;
            const transactionArray = []
            for (let i in results) {
                const data = results[i].data.substring(2);
                if(data) {
                    const payload = insertNewlines(data);
                    const method = payload[payload.length - 1];
                    if (method === comparisonJL) {
                        let transactionPayload = {
                            from: '0x'+payload[0].substring(40),
                            to: '0x'+payload[1].substring(40),
                            amount: web3.utils.hexToNumber('0x'+payload[2]),
                            timestamp: new Date(web3.utils.hexToNumber('0x'+payload[3])*1000).toLocaleString(),
                            method: "Joined Loan"
                        };
                        transactionArray.push(transactionPayload);
                    }

                    else if (method === comparisonLC) {
                        let transactionPayload = {
                            from: '0x'+payload[0].substring(40),
                            to: '0x0',
                            amount: 0,
                            timestamp: new Date(web3.utils.hexToNumber('0x'+payload[4])*1000).toLocaleString(),
                            method: "Loan Created"
                        };
                        transactionArray.push(transactionPayload);
                    }

                    else if (method === comparisonCD) {
                        let transactionPayload = {
                            from: '0x0',
                            to: '0x'+payload[0].substring(40),
                            amount: web3.utils.hexToNumber('0x'+payload[1]),
                            timestamp: new Date(web3.utils.hexToNumber('0x'+payload[2])*1000).toLocaleString(),
                            method: "Capital Drawn"
                        };
                        transactionArray.push(transactionPayload);
                    }

                    else if (method === comparisonLR) {
                        let transactionPayload = {
                            from: '0x'+payload[0].substring(40),
                            to: '0x0',
                            amount: web3.utils.hexToNumber('0x'+payload[1]),
                            timestamp: new Date(web3.utils.hexToNumber('0x'+payload[2])*1000).toLocaleString(),
                            method: "Loan Repaid"
                        };
                        transactionArray.push(transactionPayload);
                    }

                    else if (method === comparisonWD) {
                        let transactionPayload = {
                            from: '0x0',
                            to: '0x'+payload[0].substring(40),
                            amount: web3.utils.hexToNumber('0x'+payload[1]),
                            timestamp: new Date(web3.utils.hexToNumber('0x'+payload[2])*1000).toLocaleString(),
                            method: "Withdrawal"
                        };
                        transactionArray.push(transactionPayload);
                    }
                }
            }
            return transactionArray
        }
        catch (error) {
            console.error(error)
            return transactionArray

        }
    },

}

module.exports = {
    logs
}