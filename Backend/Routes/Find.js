const express = require('express');
const find = express.Router();
const {search} = require("../Controller/Finders/Search");



find.post("/search", search)

find.post("/find")