const { collection, user } = require("../util/MongoDB");

async function tracker(conditions, userInfo) {
  const {
    text,
    price1,
    price2,
    locaitonCodes,
    types,
    firstRow,
    releaseTime,
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
    sections: locaitonCodes,
    types: types,
    firstRow: firstRow,
    releaseTime: new Date(releaseTime),
    trackTime: new Date(),
  };

  const userResult = await user.find(findUser).toArray();
  console.log(userResult, "============ user Result ===============");
  if (userResult.length === 0) {
    console.log("insert at new user");
    user.insertOne({
      userId: userId,
      userName: displayName,
      trackHistory: [trackRecord],
    });
  } else {
    console.log("insert at existed user");
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
  const latestTrackConditions = []
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    console.log(r, "user info ");
    if(r.notify === true && r.userId !== "" && r.latestTrackCondition !== null) latestTrackConditions.push(r)
  }

  console.log(latestTrackConditions, "test")

  return latestTrackConditions;
}

async function checkNewHouses(c) {
  const { title, minRent, maxRent, sections, types, releaseTime } =
    c.latestTrackCondition;
  const { userId } = c;

  const batch = await collection.find().sort({ batch: -1 }).limit(1).toArray();
  console.log(batch, "符合 batch 最大的房屋");
  let findHouse = {
    title: {
      $regex: title,
    },
    price: { $gte: minRent, $lte: maxRent },
    section: { $in: sections },
    type: { $in: types },
    batch: batch[0].batch,
    converted_time: { $gte: new Date(releaseTime) || new Date("2000-01-31") }, // 之後要拿掉
  };
  console.log(findHouse, "02 findHouse");

  const houses = await collection
    .find(findHouse)
    .sort({ converted_time: -1 })
    .limit(100)
    .toArray();
  console.log(houses, "未篩選過捷運的 houses");
  if (houses.length === 0) {
    houses.push({ id_591: null });
    return houses;
  }
  houses.userId = userId;
  console.log(houses, "houses");

  return houses;
}

module.exports = {
  tracker,
  checkNewHouses,
  getAllTrackerConditions,
};
