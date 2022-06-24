const express = require('express');
const find = express.Router();
const {search} = require("../Controller/Finder");



find.post("/", search)


module.exports = find