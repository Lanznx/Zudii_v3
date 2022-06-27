const { user } = require("../util/MongoDB");

async function setUserAccessTokenModel(code, userId) {
  user.updateOne({ userId: userId }, { $set: { access_token: code } });
}

async function getUserAccessTokenModel(userId) {
  const accessToken = await user.find({ userId: userId }).toArray();
  return accessToken
}

module.exports = {
  setUserAccessTokenModel,
  getUserAccessTokenModel
};
