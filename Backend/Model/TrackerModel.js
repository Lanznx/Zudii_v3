const { collection, user } = require("../util/MongoDB");

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join("-") +
    " " +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(":")
  );
}

async function tracker(conditions, userInfo) {
  const { text, price1, price2, locaitonCodes, types, firstRow } = conditions;
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
    trackTime: formatDate(new Date()),
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
      { $set: { userName: displayName } },
      { $push: { trackHistory: trackRecord } }
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
    },
  };
  const latestTrackConditions = await user.aggregate([getConditions]).toArray();
  return latestTrackConditions;
}

async function checkNewHouses(c) {
  const { title, minRent, maxRent, sections, types } = c.latestTrackCondition;
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
  };
  console.log(findHouse, "02 findHouse");

  const result = await collection
    .find(findHouse)
    .sort({ id_591: -1 })
    .skip(0)
    .limit(10)
    .toArray();
  if (result.length === 0) {
    result.push({ id_591: null });
  }

  result.userId = userId;
  result.msg = `https://i.imgur.com/MwS42AE.png?search/track?${title}&${minRent}&${maxRent}&${sections}&${types}&0&${
    batch[0].batch
  }?${userId}&${null}`;

  return result;
}

module.exports = {
  tracker,
  checkNewHouses,
  getAllTrackerConditions,
};
