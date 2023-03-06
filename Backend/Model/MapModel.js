const { collection, user } = require("../util/MongoDB");

async function mapSearcher(limitations) {
  const { userId, coordinates, minRent, maxRent, type, releaseTime } =
    limitations;

  const pinpointHouse = {
    price: {
      $gte: minRent,
      $lte: maxRent,
    },
    type: {
      $in: type,
    },
    converted_time: {
      $gte: new Date(releaseTime),
    },
  };

  const searchRecord = {
    title: "",
    minRent: minRent,
    maxRent: maxRent,
    region: null,
    sections: null,
    types: type,
    firstRow: null,
    releaseTime: new Date(releaseTime),
    distanceMRT: null,
    searchTime: new Date(),
  };

  const findUser = {
    userId: userId,
  };

  const user_result = await user.find(findUser).toArray();
  if (user_result.length === 0) {
    user.insertOne({
      userId: userId,
      searchHistory: [searchRecord],
    });
  } else {
    user.updateOne(
      { userId: userId },
      { $push: { searchHistory: searchRecord } }
    );
  }

  const house_result = await collection
    .aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: coordinates,
          },
          distanceField: "distance",
          maxDistance: 1000,
          spherical: true,
        },
      },
      {
        $match: pinpointHouse,
      },
      {
        $sort: {
          distance: 1,
        },
      },
    ])
    .sort({ converted_time: -1 })
    .limit(10)
    .toArray();

  if (house_result.length === 0) {
    house_result.push({ id_591: null });
  }
  return house_result;
}

module.exports = {
  mapSearcher,
};
