const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const portfolioSchema = new Schema({
  _id: false,
  amount: {
    type: Number,
    default: 0,
    required: true,
  },
  loanPoolId: {
    type: String,
    unique: true,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const proofSchema = new Schema({
  _id: false,
  proofResidence: {
    type: String,
  },
  proofIdentity: {
    type: String,
  },
  selfie: {
    type: String,
  },
});

const kycSchema = new Schema({
  _id: false,
  address: {
    type: Boolean,
    default: false,
  },
  identity: {
    type: Boolean,
    default: false,
  },
  selfie: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: Boolean,
    default: false,
  },
  email: {
    type: Boolean,
    default: false,
  },
});

const walletSchema = new Schema({
  _id: false,
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
    default: "Chainalysis",
  },
});

const lenderProfileSchema = new Schema({
  lenderId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: "Anonymous",
    required: true,
  },
  dob: {
    type: Date,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  nationality: {
    type: String,
  },
  countryCode: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "Active",
  },
  portfolio: [portfolioSchema],
  proof: proofSchema,
  kyc: kycSchema,
  wallets: [walletSchema],
});

module.exports = mongoose.model("User", lenderProfileSchema, "lenders");
