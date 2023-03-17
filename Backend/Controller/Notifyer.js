const {
  setUserAccessTokenModel,
  getUserAccessTokenModel,
  cancelNotifyModel,
} = require("../Model/NotifyerModel");
const axios = require("axios");
require("dotenv").config();

async function setUserAccessToken(req, res) {
  const { code, state } = req.body;
  axios
    .post(
      `https://notify-bot.line.me/oauth/token?code=${code}&grant_type=authorization_code&redirect_uri=https://zudii.tk/api/notify&client_id=${process.env.NOTIFY_ID}&client_secret=${process.env.NOTIFY_SECRET}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    )
    .then((res) => {
      setUserAccessTokenModel(res.data.access_token, state);
    })
    .catch((err) => {
      console.log(err, "ERROR");
    });
}

async function getUserAccessToken(userId) {
  const accessToken = await getUserAccessTokenModel(userId);
  return accessToken;
}

async function cancelNotify(req, res) {
  const userId = req.body.userId;
  const result = await cancelNotifyModel(userId);
  if (result.acknowledged === true) {
    res.send({ success: true, status: 200, message: "成功解除通知！" });
  } else {
    res.send({
      success: false,
      status: 400,
      message: "解除通知失敗\n請再試一次",
    });
  }
}

module.exports = {
  setUserAccessToken,
  getUserAccessToken,
  cancelNotify,
};
