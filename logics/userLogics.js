// userLogics.js
const User = require("../models/lenderModels");
const mongoose = require('mongoose');

const mongouri = process.env.CONNECTION_URL;

const Lenders = {
    findById: async (identifier) => {
        let query;
        if (identifier.includes('@')) {
            // If the identifier contains '@', consider it as an email
            query = { email: identifier };
        } else {
            // Otherwise, consider it as lenderId
            query = { lenderId: identifier };
        }

        try {
            await mongoose.connect(mongouri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: "PeerHive"
            });

            const docs = await User.findOne(query);
            return docs;
        } catch (error) {
            console.error('Error in finding lender by ID or email', error);
            throw error;
        }
    },

    updateUser: async (identifier, updatedData) => {
        let query;
        if (identifier.includes('@')) {
            // If the identifier contains '@', consider it as an email
            query = { email: identifier };
        } else {
            // Otherwise, consider it as lenderId
            query = { lenderId: identifier };
        }

        try {
            await mongoose.connect(mongouri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: "PeerHive"
            });

            // Exclude portfolio update logic here if needed

            const updatedUser = await User.findOneAndUpdate(query, updatedData, { new: true });
            return updatedUser;
        } catch (error) {
            console.error('Error in updating lender', error);
            throw error;
        }
    }
};

module.exports = {
    Lenders
};
