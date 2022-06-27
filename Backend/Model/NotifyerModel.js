const { user } = require("../util/MongoDB");


// what if user info is not in the database yet ?
async function setUserAccessTokenModel(code, userId) {
  user.updateOne({ userId: userId }, { $set: { access_token: code } });
}

async function getUserAccessTokenModel(userId) {
  const result = await user.find({ userId: userId }).toArray();
  const accessToken = result[0].access_token
  return accessToken
}

module.exports = {
  setUserAccessTokenModel,
  getUserAccessTokenModel
};
