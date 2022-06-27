const { setUserAccessTokenModel, getUserAccessTokenModel } = require("../Model/NotifyerModel");

async function setUserAccessToken(req, res) {
    const {code, state} = req.body

    setUserAccessTokenModel(code, state)
    return 
}


async function getUserAccessToken(userId){
    const accessToken = await getUserAccessTokenModel(userId)
    return accessToken
}

module.exports = {
  setUserAccessToken,getUserAccessToken
};
