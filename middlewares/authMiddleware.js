const authPkg = require('@clerk/clerk-sdk-node')
const { MongoClient } = require('mongodb');
const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = 'Auth';
const jwt = require('jsonwebtoken');
const API_ENCODING = process.env.API_ENCODING;
const { sessions } = authPkg;

const authenticateSessions = async (req, res, next) => {
  sessionId = req.header("session");
  if (!sessionId) {
    res.status(400).send({message: 'No session id is not provided'});
  }
  else {
    const payload = await sessions.getSession(sessionId);
    if (payload.status == "active") {
      console.log("valid session ID");
      next()
    }
    else {
      res.status(403).send({error: {code: 403, message: "Session Not Authenticated"}});
    }
  }
}

const api_auth = async (req, res, next) => {
  const client = new MongoClient(CONNECTION_URL, { useNewUrlParser: true });
  const database = await client.db(DATABASE_NAME);
  const publicKey = req.header('publickey');
  const api_key = req.header("x-api-key");
  try {
    await client.connect();
    const collection = await database.collection('User');
    const account = await collection.find({user: publicKey}).toArray();
    const key = account[0].key;
    const apiAuth = jwt.verify(key, API_ENCODING) == api_key
    if (apiAuth) {
      console.log("API Key Authenticated");
      next();
    } else {
      res.status(403).send({error: {code: 403, message: "API Not Authenticated"}})
    }
  }
  catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
  finally {
    // Close the MongoDB connection when done
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}
module.exports = {
  authenticateSessions,
  api_auth
}