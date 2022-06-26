const { collection, user } = require("../util/MongoDB");

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(':')
  );
}



async function searcher(conditions, userInfo) {
  const { text, price1, price2, locaitonCodes, types, firstRow, batch } = conditions;
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

  let findHouse = {
    title: {
      $regex: text,
    },
    price: { $gte: minRent, $lte: maxRent },
    section: { $in: locaitonCodes },
    type: { $in: types },
    batch: batch
  };

  let findUser = {
    userId: userId,
  };

  let searchRecord = {
    title: text,
    minRent: minRent,
    maxRent: maxRent,
    sections: locaitonCodes,
    types: types,
    firstRow: firstRow,
    searchTime: formatDate(new Date())
  };

  const userResult = await user.find(findUser).toArray();
  console.log(userResult, "============ user Result ===============");
  console.log(userResult.length, "============ length ===============");
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

  const result = await collection 
    .find(findHouse)
    .sort({ id_591: -1 })
    .skip(firstRow)
    .limit(10)
    .toArray();
  if (result.length === 0) {
    result.push({ id_591: null });
  }
  return result;
}

module.exports = {
  searcher,
};
