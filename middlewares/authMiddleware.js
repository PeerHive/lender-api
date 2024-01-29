const authPkg = require('@clerk/clerk-sdk-node')
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = 'Auth';
const jwt = require('jsonwebtoken');
const User = require('../models/lenderModels');

const API_ENCODING = process.env.API_ENCODING; // PeerHive internal API encoding
const mongouri = process.env.CONNECTION_URL;

const { sessions, users } = authPkg;


const checkUserandUpdate = async (req, res, next) => {
  const userId = (await sessions.getSession(req.header("session"))).userId;
  const getUser = await users.getUser(userId)
  const queryEmail = {'email': getUser.emailAddresses[0].emailAddress};
  try {
    await mongoose.connect(mongouri, {useNewUrlParser: true, useUnifiedTopology: true, dbName: "PeerHive"});
    const user = await User.find(queryEmail);
    if( user[0] ) {
      next()
    }
    else if ( !user[0] ) {
      newUser = {
        lenderId: `lender_${(await User.countDocuments() + 1).toString().padStart(6, "0")}`,
        name: `${getUser.firstName} ${getUser.lastName}`,
        email: getUser.emailAddresses[0].emailAddress,
        created: new Date(getUser.createdAt),
        proof: {
          proofResidence: "png_residence",
          proofIdentity: "png_ic",
          selfie: "png_selfie"
        },
        kyc: {
          address: false,
          identity: false,
          selfie: false,
          phoneNumber: false,
          email: true
        }
      }
      await User.create(newUser).then(userFunc=> {
        userFunc.save().then(afterSave => {
          mongoose.connection.close()
        })
      })
      next()
    }
  }
  catch (e) {
    res.status(400).send({message: 'Error creating user'});
  }
};

/*
SessionId authentication middleware
verifying the activeness of the sessionId
Return: Nil
*/
const authenticateSessions = async (req, res, next) => {
  const sessionId = req.header("session");
  if (!sessionId) {
    res.status(400).send({message: 'No session id is not provided'});
  }
  else {
    const payload = await sessions.getSession(sessionId);
    const userId = payload.userId;
    const getUser = await users.getUser(userId)
    const queryEmail = {'email': getUser.emailAddresses[0].emailAddress};
    if (payload.status === "active") {
      try {
        await mongoose.connect(mongouri, {useNewUrlParser: true, useUnifiedTopology: true, dbName: "PeerHive"});
        const user = await User.find(queryEmail);
        if( user[0] ) {
          next()
        }
        else if ( !user[0] ) {
          newUser = {
            lenderId: `lender_${(await User.countDocuments() + 1).toString().padStart(6, "0")}`,
            name: `${getUser.firstName} ${getUser.lastName}`,
            email: getUser.emailAddresses[0].emailAddress,
            created: new Date(getUser.createdAt),
            proof: {
              proofResidence: "png_residence",
              proofIdentity: "png_ic",
              selfie: "png_selfie"
            },
            kyc: {
              address: false,
              identity: false,
              selfie: false,
              phoneNumber: false,
              email: true
            }
          }
          User.create(newUser).then(userFunc=> {
            userFunc.save().then(afterSave => {
              mongoose.connection.close()
              next()
            })
          })
        }
      }
      catch (e) {
        res.status(400).send({message: 'Error creating user'});
      }
    }
    else {
      res.status(403).send({error: {code: 403, message: "Session Not Authenticated"}});
    }
  }
};

/*
PH access api key authentication middleware
Obtain from repo owner
verifying the activeness of the API_Key to access PH web api
Return: Nil
*/
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
    const apiAuth = jwt.verify(key, API_ENCODING) === api_key
    if (apiAuth) {
      next();
    } else {
      res.status(403).send({error: {code: 403, message: "API Not Authenticated"}})
    }
  }
  catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(403).send({error: {code: 403, message: "API Not Authenticated"}})
  }
  finally {
    // Close the MongoDB connection when done
    await client.close();
    console.log('Disconnected from MongoDB');
  }
};


module.exports = {
  checkUserandUpdate,
  authenticateSessions,
  api_auth
}