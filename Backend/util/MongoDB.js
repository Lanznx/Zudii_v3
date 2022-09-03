require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_CONNECTION;
const MONGO_COLLECTION = process.env.MONGO_COLLECTION;
const client = new MongoClient(uri, { useNewUrlParser: true });
const collection = client.db("test").collection(MONGO_COLLECTION);
const user = client.db("test").collection("user");
const mrt = client.db("test").collection("MRT");

module.exports = { collection, user, mrt };
