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
    releaseTime: new Date(releaseTime),
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
    .sort({ converted_time: -1 })
    .skip(firstRow)
    .limit(10)
    .toArray();
  console.log(houses, "未篩選過捷運的 houses");
  if (houses.length === 0) {
    houses.push({ id_591: null });
    return houses;
  }

  console.log(houses, "houses");
  return houses;

}

module.exports = {
  searcher,
};
