const express = require("express");
const notify = express.Router();
const {setUserAccessToken} = require("../Controller/Notifyer")

notify.post("/", setUserAccessToken);

module.exports = notify;
