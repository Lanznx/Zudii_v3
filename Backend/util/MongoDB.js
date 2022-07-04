require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_CONNECTION;
const client = new MongoClient(uri, { useNewUrlParser: true });
const collection = client.db("test").collection("dev_591");
const user = client.db("test").collection("user");
const mrt = client.db("test").collection("MRT")

module.exports = { collection, user, mrt };
