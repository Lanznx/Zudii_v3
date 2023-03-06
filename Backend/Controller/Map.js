const { mapSearcher } = require("../Model/MapModel");

async function mapSearch(req, res) {
  try {
    const limitations = {
      userId: req.body.userId,
      coordinates: req.body.coordinates,
      minRent: req.body.minRent || 0,
      maxRent: req.body.maxRent || 10000000,
      type: req.body.type || [],
      releaseTime: req.body.releaseTime || "2022-01-01",
    };
    const result = await mapSearcher(limitations);
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  mapSearch,
};
