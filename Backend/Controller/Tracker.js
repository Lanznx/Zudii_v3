const {
  tracker,
  checkNewHouses,
  getAllTrackerConditions,
} = require("../Model/TrackerModel");

function track(req, res) {
  const conditions = {
    text: req.body.text || "",
    price1: req.body.price1 || 0,
    price2: req.body.price2 || 100000000,
    regionCode: req.body.regionCode,
    sectionCodes: req.body.sectionCodes,
    types: req.body.types,
    firstRow: req.body.firstRow || 0,
    releaseTime: req.body.releaseTime,
    distanceMRT: req.body.distanceMRT,
  };
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

  const crawlerResults = [];
  for (let index_1 = 0; index_1 < latestTrackConditions.length; index_1++) {
    let unitResults = await checkNewHouses(latestTrackConditions[index_1]);
    if (unitResults.length === 0) {
      crawlerResults.push({
        push_messages: null,
        userId: unitResults.userId,
      });
      continue;
    }
    let push_messages = [];
    let push_message = `符合您的最新結果如下：\n\n`;

    for (let index_2 = 0; index_2 < unitResults.length; index_2++) {
      const house = unitResults[index_2];

      if (house.size === "Nan") house.size = "沒有資料";
      else house.size = house.size + " 坪";

      let unit_message = `
      ${index_2 + 1}.\n${house.title}\n租金：${house.price} 元\n地址：${
        house.location
      }\n${house.surrounding.type}：${house.surrounding.desc}\n距離：${
        house.surrounding.distance
      } 公尺\n房型：${house.type}\n坪數：${house.size}\n發布時間：${
        house.release_time
      }\n貼文連結：${house.link}\n 
      ====================\n
      `; // 之後要改地圖網址

      if (index_2 + 1 === unitResults.length) {
        push_message += unit_message;
        push_messages.push(push_message);
      } else if ((push_message + unit_message).length <= 999) {
        push_message += unit_message;
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
  return crawlerResults;
}

module.exports = { track, check };
