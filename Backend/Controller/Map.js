const { mapSearcher } = require("../Model/MapModel");

async function mapSearch(req, res) {
  try {
    const limitations = {
      userId: req.body.userId,
      coordinates: [parseFloat(req.body.coordinates[0]), parseFloat(req.body.coordinates[1])],
      minRent: req.body.minRent || 0,
      maxRent: req.body.maxRent || 10000000,
      type: req.body.type || [],
      releaseTime: req.body.releaseTime || "2022-01-01",
    };
    const raw_data = await mapSearcher(limitations);
    if(raw_data[0]["id_591"] === null) {
      res.status(200).send([]);
      return;
    }

    const result = raw_data.map((house) => {
      return {
        imgLink: house.imgLink,
        shortUrl: house.short_url,
        location: house.location,
        coordinates: house.position.coordinates,
        rent: house.price,
        releaseTime: house.release_time,
        type: house.type,
        size: house.size,
      };
    });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send([]);
  }
}

module.exports = {
  mapSearch,
};
