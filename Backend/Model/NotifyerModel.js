const { user } = require("../util/MongoDB");

// what if user info is not in the database yet ?
async function setUserAccessTokenModel(access_token, userId) {
  const result = await user.find({ userId: userId }).toArray();
  console.log(result, "findUser");
  if (result.length === 0) {
    user.insertOne({
      userId: userId,
      access_token: access_token,
    });
  } else {
    user.updateOne(
      { userId: userId },
      { $set: { access_token: access_token } }
    );
  }
}

async function getUserAccessTokenModel(userId) {
  const result = await user.find({ userId: userId }).toArray();
  const accessToken = result[0].access_token;
  return accessToken;
}

module.exports = {
  setUserAccessTokenModel,
  getUserAccessTokenModel,
};
