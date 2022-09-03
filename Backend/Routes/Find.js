const express = require('express');
const find = express.Router();
const { search } = require("../Controller/Finder");
const { getLastCondition } = require("../Controller/user");


find.post("/", search)

find.post("/myCondition", getLastCondition)


module.exports = find