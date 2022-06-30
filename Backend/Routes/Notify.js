const express = require("express");
const notify = express.Router();
const {setUserAccessToken, cancelNotify} = require("../Controller/Notifyer")

notify.post("/", setUserAccessToken);

notify.post("/cancel", cancelNotify)

module.exports = notify;
