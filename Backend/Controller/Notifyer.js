const {
  setUserAccessTokenModel,
  getUserAccessTokenModel,
} = require("../Model/NotifyerModel");
const axios = require("axios");
require("dotenv").config();

async function setUserAccessToken(req, res) {
  const { code, state } = req.body;
  console.log(process.env.NOTIFY_ID, "process.env.NOTIFY_ID")
  console.log(process.env.NOTIFY_SECRET, "process.env.NOTIFY_SECRET")
  console.log(req.response, "REQUEST");
  console.log(code, "setUserAccessTokenModel: CODE");
  console.log(state, "setUserAccessTokenModel: userID");
  axios
    .post(
      "https://notify-bot.line.me/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "https://zudii.tk/api/notify",
        client_id: process.env.NOTIFY_ID,
        client_secret: process.env.NOTIFY_SECRET,
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    )
    .then((data) => {
      console.log(data, "DATA");
      setUserAccessTokenModel(data, state);
    })
    .catch((err) => {
      console.log(err, "ERROR");
    });
}

async function getUserAccessToken(userId) {
  const accessToken = await getUserAccessTokenModel(userId);
  return accessToken;
}

module.exports = {
  setUserAccessToken,
  getUserAccessToken,
};
