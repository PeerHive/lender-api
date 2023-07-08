const mongoose = require("mongoose");

const portfolioSchema = mongoose.Schema( {    
    amount: {
        type: Number, 
        default: 0
    },
    poolId: {
        type: String,
        unique: true
    },
    wallet: {
        type: String
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

const proofSchema = mongoose.Schema({
    proofResidence: {
        type: String
    },
    proofIdentity: {
        type: String
    },
    selfie: {
        type: String
    }
});

const kycSchema = mongoose.Schema({
    address: {
        type: Boolean,
        default: false
    },
    identity: {
        type: Boolean,
        default: false
    },
    selfie: {
        type: Boolean,
        default: false
    },
    phoneNumber: {
        type: Boolean,
        default: false
    },
    email: {
        type: Boolean,
        default: false
    }
});


const walletSchema = mongoose.Schema({
    walletId: {
        type: String,
    },
    network: {
        type: String,
    },
    kyw: {
        type: Boolean,
        default: false,
    },
    kywSource: {
        type: String,
        default: "Chainalysis"
    }
});


const lenderProfile = mongoose.Schema({
    lenderId: {
        type: String,
    },
    name: {
        type: String,
        default: "Anonymous"
    },
    dob: {
        type: Date
    },
    email: {
        type: String,
    },
    notionality: {
        type: String
    },
    countryCode: {
        type: String
    },
    phoneNumber: {
        type: String
    }, 
    created: {
        type: Date
    },
    status: {
        type: String,
        default: "Active"
    },
    portfolio: {
        portfolioSchema
    },
    proof:{
        proofSchema
    },
    kyc:{
        kycSchema
    },
    wallets: {
        walletSchema
    }
}, {collection: "lenders"})


module.exports = mongoose.model('User', lenderProfile);
