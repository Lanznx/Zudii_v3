const { collection, user, mrt } = require("../util/MongoDB");

async function tracker(conditions, userInfo) {
  const {
    text,
    price1,
    price2,
    regionCode,
    sectionCodes,
    types,
    firstRow,
    releaseTime,
    distanceMRT,
  } = conditions;
  const { userId, displayName } = userInfo;

  let minRent = 0;
  let maxRent = 0;
  if (price1 <= price2) {
    minRent = price1;
    maxRent = price2;
  } else {
    minRent = price2;
    maxRent = price1;
  }

  let findUser = {
    userId: userId,
  };

  let trackRecord = {
    title: text,
    minRent: minRent,
    maxRent: maxRent,
    region: regionCode,
    sections: sectionCodes,
    types: types,
    firstRow: firstRow,
    releaseTime: new Date(releaseTime),
    distanceMRT: distanceMRT,
    trackTime: new Date(),
  };

  const userResult = await user.find(findUser).toArray();
  if (userResult.length === 0) {
    user.insertOne({
      userId: userId,
      userName: displayName,
      trackHistory: [trackRecord],
    });
  } else {
    user.updateOne(
      { userId: userId },
      { $set: { userName: displayName }, $push: { trackHistory: trackRecord } }
    );
  }
}

async function getAllTrackerConditions() {
  let getConditions = {
    $project: {
      latestTrackCondition: {
        $last: "$trackHistory",
      },
      userId: true,
      notify: true,
    },
  };
  const results = await user.aggregate([getConditions]).toArray();
  const latestTrackConditions = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.notify === true && r.userId !== "" && r.latestTrackCondition !== null)
      latestTrackConditions.push(r);
  }

  return latestTrackConditions;
}

async function checkNewHouses(c) {
  const {
    title,
    minRent,
    maxRent,
    region,
    sections,
    types,
    releaseTime,
    distanceMRT,
  } = c.latestTrackCondition;
  const { userId } = c;

  const batch = await collection.find().sort({ batch: -1 }).limit(1).toArray();
  let findHouse = {
    title: {
      $regex: title,
    },
    price: { $gte: minRent, $lte: maxRent },
    region: { $in: region },
    section: { $in: sections },
    type: { $in: types },
    batch: batch[0].batch,
    converted_time: { $gte: new Date(releaseTime) || new Date("2000-01-31") },
  };

  const houses = await collection
    .find(findHouse)
    .sort({ converted_time: -1 })
    .limit(100)
    .toArray();
  if (houses.length === 0) {
    houses.push({ id_591: null });
    return houses;
  } else if (region[0] !== 1 && region[0] !== 3) {
    houses.userId = userId;
    return houses;
  }
  let contain_MRT_Houses = [];

  for (let index = 0; index < houses.length; index++) {
    const house = houses[index];
    const MRT_stations = await mrt
      .aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: house.position.coordinates,
            },
            distanceField: "Distance",
            maxDistance: distanceMRT || 1000, // 之後要拿掉
            spherical: true,
          },
        },
        {
          $project: {
            Distance: true,
            stationName: {
              $arrayElemAt: [
                {
                  $split: ["$出入口名稱", "出口"],
                },
                0, // 這個很重要不能動！
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              stationName: "$stationName",
            },
            distance: {
              $min: "$Distance",
            },
          },
        },
        {
          $sort: {
            distance: 1,
          },
        },
      ])
      .toArray();
    if (MRT_stations.length > 0) {
      house["stations"] = [];
      MRT_stations.map((s) => {
        house["stations"].push({
          stationName: s._id.stationName,
          distance: Math.round(s.distance),
        });
      });
      contain_MRT_Houses.push(house);
    }
  }
  contain_MRT_Houses.userId = userId;

  return contain_MRT_Houses;
}

module.exports = {
  tracker,
  checkNewHouses,
  getAllTrackerConditions,
};
