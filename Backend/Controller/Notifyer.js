const {
  setUserAccessTokenModel,
  getUserAccessTokenModel,
  cancelNotifyModel,
} = require("../Model/NotifyerModel");
const axios = require("axios");
require("dotenv").config();

async function setUserAccessToken(req, res) {
  const { code, state } = req.body;
  console.log(process.env.NOTIFY_ID, "process.env.NOTIFY_ID");
  console.log(process.env.NOTIFY_SECRET, "process.env.NOTIFY_SECRET");
  console.log(code, "setUserAccessTokenModel: CODE");
  console.log(state, "setUserAccessTokenModel: userID");
  axios
    .post(
      `https://notify-bot.line.me/oauth/token?code=${code}&grant_type=authorization_code&redirect_uri=https://zudii.tk/api/notify&client_id=${process.env.NOTIFY_ID}&client_secret=${process.env.NOTIFY_SECRET}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    )
    .then((res) => {
      console.log(res.data.access_token, "使用者的 Access Token");
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
  console.log(req.body)
  const userId = req.body.userId;
  const result = cancelNotifyModel(userId);
  if (result.acknowledged === true) {
    res.send({ success: true, status: 200, message: "成功解除通知！" });
  }else {
    res.send({success: false, status: 400, message: "解除通知失敗\n請再試一次"})
  }
}

module.exports = {
  setUserAccessToken,
  getUserAccessToken,
  cancelNotify,
};
