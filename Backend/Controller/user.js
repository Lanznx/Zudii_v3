const { getLastConditionModel } = require("../Model/user");

async function getLastCondition(req, res) {
    const userId = req.body.userId;
    const lastCondition = await getLastConditionModel(userId);
    if (lastCondition === null) {
        res.status(200).send({
            success: false,
            data: null
        })
    } else {
        res.status(200).send({
            success: true,
            data: lastCondition
        })
    }
}

module.exports = { getLastCondition };