require('dotenv').config();

const { MongoClient } = require('mongodb');
const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = 'PeerHive';

async function databaseConnection() {
    const client = new MongoClient(CONNECTION_URL, { useNewUrlParser: true });
    try {
        await client.connect();

        const db = client.db(DATABASE_NAME);
        console.log('Connected to ' + DATABASE_NAME);
        return {client, db};
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}


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



module.exports = { databaseConnection ,databaseQuery }