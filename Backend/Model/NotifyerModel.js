const { user } = require("../util/MongoDB");

// what if user info is not in the database yet ?
async function setUserAccessTokenModel(access_token, userId) {
  const result = await user.find({ userId: userId }).toArray();
  console.log(result, "findUser");
  if (result.length === 0) {
    user.insertOne({
      userId: userId,
      access_token: access_token,
      notify: true,
    });
  } else {
    user.updateOne(
      { userId: userId },
      { $set: { access_token: access_token, notify: true } }
    );
  }
}

async function getUserAccessTokenModel(userId) {
  const result = await user.find({ userId: userId }).toArray();
  const accessToken = result[0].access_token;
  return accessToken;
}

async function cancelNotifyModel(userId) {
  const result = user.updateOne(
    {
      userId: userId,
    },
    {
      $set: {
        notify: false,
      },
    }
  );

  return result
}

module.exports = {
  setUserAccessTokenModel,
  getUserAccessTokenModel,
  cancelNotifyModel,
};
