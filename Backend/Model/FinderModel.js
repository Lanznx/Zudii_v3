const { collection, user, mrt } = require("../util/MongoDB");

async function searcher(conditions, userInfo) {
  const {
    text,
    price1,
    price2,
    locaitonCodes,
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

  const findHouse = {
    title: {
      $regex: text,
    },
    price: { $gte: minRent, $lte: maxRent },
    section: { $in: locaitonCodes },
    type: { $in: types },
    converted_time: { $gte: new Date(releaseTime) },
  };

  const findUser = {
    userId: userId,
  };

  const searchRecord = {
    title: text,
    minRent: minRent,
    maxRent: maxRent,
    sections: locaitonCodes,
    types: types,
    firstRow: firstRow,
    releaseTime: releaseTime,
    distanceMRT: distanceMRT,
    searchTime: new Date(),
  };

  const userResult = await user.find(findUser).toArray();
  console.log(userResult, "============ user Result ===============");
  if (userResult.length === 0) {
    user.insertOne({
      userId: userId,
      userName: displayName,
      searchHistory: [searchRecord],
    });
  } else {
    console.log("insert at existed user");
    user.updateOne(
      { userId: userId },
      { $push: { searchHistory: searchRecord } }
    );
  }

  const houses = await collection
    .find(findHouse)
    .sort({ id_591: -1 })
    .skip(firstRow)
    .limit(10)
    .toArray();
  console.log(houses, "未篩選過捷運的 houses");
  if (houses.length === 0) {
    houses.push({ id_591: null });
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
            maxDistance: distanceMRT || 1000, //之後要拿掉
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
                0,
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
  console.log(contain_MRT_Houses, "contain_MRT_Houses");
  return contain_MRT_Houses;
}

module.exports = {
  searcher,
};
