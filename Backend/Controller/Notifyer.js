const { setUserAccessTokenModel, getUserAccessTokenModel } = require("../Model/NotifyerModel");

async function setUserAccessToken(req, res) {
    const {code, state} = req.body
    setUserAccessTokenModel(code, state)
    console.log(code, "setUserAccessTokenModel: CODE")
    console.log(state, "setUserAccessTokenModel: userID")
}


async function getUserAccessToken(userId){
    const accessToken = await getUserAccessTokenModel(userId)
    return accessToken
}

module.exports = {
  setUserAccessToken,getUserAccessToken
};
