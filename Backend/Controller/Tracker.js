const {
  tracker,
  checkNewHouses,
  getAllTrackerConditions,
} = require("../Model/TrackerModel");

async function track(req, res) {
  const conditions = {
    text: req.body.text || "",
    price1: req.body.price1 || 0,
    price2: req.body.price2 || 100000000,
    locaitonCodes: req.body.locaitonCodes,
    types: req.body.types,
    firstRow: req.body.firstRow || 0,
  };
  console.log(conditions, "============ conditions ===============");
  const userInfo = {
    userId: req.body.userId,
    displayName: req.body.displayName,
  };

  tracker(conditions, userInfo);

  let replyMessages = {
    type: "text",
    text: "您的爬蟲正在進行中，每 30 分鐘會回報一次結果！\n若要查詢目前符合條件的房屋，請點選「查詢」",
  };
  return replyMessages;
}

async function check() {
  const latestTrackConditions = await getAllTrackerConditions();

  console.log(latestTrackConditions, " 01 大家的 conditions");

  const crawlerResults = [];
  for (let index_1 = 0; index_1 < latestTrackConditions.length; index_1++) {
    let unitResults = await checkNewHouses(latestTrackConditions[index_1]);
    if (unitResults[0].id_591 === null) {
      crawlerResults.push({
        push_messages: null,
        userId: unitResults.userId,
      });
      continue;
    }
    console.log(unitResults, "04 個人的 houses");
    let push_messages = [];
    let push_message = `符合您的最新結果如下：\n\n`;

    for (let index_2 = 0; index_2 < unitResults.length; index_2++) {
      const house = unitResults[index_2];

      let unit_message = `
      ${index_2 + 1}.\n${house.title}\n租金：${house.price} 元\n地址：${
        house.location
      }\n房型：${house.type}\n坪數：${house.size} 坪\n連結：${
        house.link
      }\n====================\n
      `;
      if ((push_message + unit_message).length <= 999) {
        push_message += unit_message;
      } else if (index_2 + 1 === unitResults.length) {
        push_messages.push(push_message);
      } else {
        push_messages.push(push_message);
        push_message = unit_message;
      }
    }
    crawlerResults.push({
      push_messages: push_messages,
      userId: unitResults.userId,
    });
  }

  console.log(crawlerResults, "05 要推播的訊息們");

  return crawlerResults;
}

module.exports = { track, check };
