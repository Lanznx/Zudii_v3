const express = require('express');
const map = express.Router();
const { mapSearch } = require("../Controller/Map");


map.post("/", mapSearch)

module.exports = map