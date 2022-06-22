require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_CONNECTION;
const client = new MongoClient(uri, { useNewUrlParser: true });
const collection = client.db("test").collection("test_591");
const user = client.db("test").collection("user");

module.exports = { collection, user };
