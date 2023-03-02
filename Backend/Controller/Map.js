const { mapSearcher } = require("../Model/MapModel");

async function mapSearch(req, res){
    try {
        const limitations = {
            userId: req.body.userId, 
            coordinate: req.body.coordinate,
            minRent: req.body.minRent || 0,
            maxRent: req.body.maxRent || 10000000,
            type: req.body.type || [],
            search: req.body.search || [],
            releaseTime: req.body.releaseTime || "2022-01-01",
        };
        const result = await mapSearcher(limitations);
        return result;

    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    mapSearch,
};