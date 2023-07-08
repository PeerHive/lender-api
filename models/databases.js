require('dotenv').config();

const { MongoClient } = require('mongodb');
const mongoose = require("mongoose");

const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = 'PeerHive';

// Initialized Mongoose Database connection
// Return: Mongoose Coonnection
async function mongooseConnection() {
    try {
        await mongoose.connect(CONNECTION_URL, { 
            useNewUrlParser: true,
            dbName: DATABASE_NAME
        });
        console.log("Mongoose Connected")
        return mongoose.connection

    } catch (error) {
        console.error('Error connecting via Mongoose', error);
    }
}

// Initialized Database connection to MongoDB
// Return: Client: client handler
//         database: return the database handler
async function databaseConnection() {
    const client = new MongoClient(CONNECTION_URL, { useNewUrlParser: true });
    try {

        await client.connect();
        const db = client.db(DATABASE_NAME); // This will connect to Database

        return {client, db};

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

// Initialized database query
// Param col: str, name of the collection 
// Return: Collection: array, return the collection of the collection name
async function databaseQuery(col) {
    const {client, db} = await databaseConnection();
    try {

        const collection = db.collection(col);
        const docs = await collection.find({}).toArray();

        return docs

    } catch (error) {
        console.error('Error performing database operations:', error);

    } finally {
        // Close the MongoDB connection when done
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}



module.exports = { 
    databaseConnection,
    databaseQuery,
    mongooseConnection
}