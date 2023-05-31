const database = require('../models/databases');

// User Model Methods
// Depracted 31 May 2023 (Will be updated)

async function userConnection() {
    const { client, db } = await database.databaseConnection();
    try {

        const collection = db.collection('users');
        return {client, collection};

    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}

const User = {
    //Function to create a new user
    create: async (user) => {
        const { client, collection } = await userConnection();
        try {

            const result = await collection.insertOne(user);

            return result.insertId;

        } finally {
            client.close();
        }
    },

    // Function to find a user by email
    findByEmail: async (email) => {
        const { client, collection } = await userConnection();
        email = email['email']
        try {

            const user = await collection.findOne( {'email': email } );

            return user;

        } finally {
            client.close();
        }
    },

    findById: async (id) => {
        const { client, collection } = await userConnection();
        try {

            const user = await collection.findOne({ _id: new ObjectID(id) });

            return user;

          } finally {
            client.close();
        }
    }
}

module.exports = User ;
