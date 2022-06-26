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
    msg: `https://i.imgur.com/MwS42AE.png?search?${text}&${minRent}&${maxRent}&${locaitonCodes}&${types}&0?${userId}&${displayName}`,
  };

  const find_existed_id_591 = [
    {
      $project: {
        id_591: true,
      },
    },
  ];
  const existed_id_591 = await collection
    .aggregate(find_existed_id_591)
    .limit(10000)
    .toArray();
  console.log(existed_id_591, "existed_id_591");

  const userResult = await user.find(findUser).toArray();
  console.log(userResult, "============ user Result ===============");
  if (userResult.length === 0) {
    console.log("insert at new user");
    user.insertOne({
      userId: userId,
      userName: displayName,
      trackHistory: [trackRecord],
      checked_id_591: existed_id_591,
    });
  } else {
    console.log("insert at existed user");
    user.updateOne(
      { userId: userId },
      { $push: { trackHistory: trackRecord } },
      { $set: { checked_id_591: existed_id_591 } }
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
      checked_id_591: true,
    },
  };
  const latestTrackConditions = await user.aggregate([getConditions]).toArray();
  return latestTrackConditions;
}

async function checkNewHouses(c) {
  const { title, minRent, maxRent, sections, types } = c.latestTrackCondition;
  const { userId, checked_id_591 } = c;

  let findHouse = {
    title: {
      $regex: title,
    },
    price: { $gte: minRent, $lte: maxRent },
    section: { $in: sections },
    type: { $in: types },
    id_591: { $nin: checked_id_591 },
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

  user.updateOne(
    { userId: userId },
    {
      $push: {
        checked_id_591: result.map((r) => {
          return r.id_591;
        }),
      },
    }
  );

  result.userId = userId;

  console.log(result, "03 res");
  return result;
}

module.exports = {
  tracker,
  checkNewHouses,
  getAllTrackerConditions,
};
