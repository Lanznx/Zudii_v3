const express = require("express");
const notify = express.Router();
const {setUserAccessToken} = require("../Controller/Notifyer")

notify.post("/", setUserAccessToken);

notify.post("/cancel", )

module.exports = notify;
