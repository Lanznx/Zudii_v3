const { user } = require("../util/MongoDB");

async function getLastConditionModel(userId) {
    const lastCondition = await user.aggregate([
        {
            '$match': {
                'userId': userId
            }
        }, {
            '$project': {
                'lastCondition': {
                    '$last': '$searchHistory'
                }
            }
        }
    ]).toArray()
    if (lastCondition.length === 0) {
        return null
    }

    return lastCondition[0]['lastCondition'];
}

module.exports = { getLastConditionModel };