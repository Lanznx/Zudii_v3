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

  console.log(latestTrackConditions, " 01 latestTrackConditions");

  const crawlerResults = [];
  for (let index_1 = 0; index_1 < latestTrackConditions.length; index_1++) {
    let unitResults = await checkNewHouses(latestTrackConditions[index_1]);
    if (unitResults[0].id_591 === null) {
      let replyMessages = null;
      crawlerResults.push({ replyMessages, userId: unitResults.userId });
      continue
    }
    console.log(unitResults, "04 unit");
    console.log(
      latestTrackConditions[index_1].latestTrackCondition.title,
      "title"
    );
    console.log(latestTrackConditions[index_1].msg, "msg");

    let replyMessages = {
      type: "flex",
      altText: `${latestTrackConditions[index_1].latestTrackCondition.title} 的結果`,
      contents: {
        type: "carousel",
        contents: [],
      },
      quickReply: {
        items: [
          {
            type: "action",
            action: {
              type: "postback",
              label: "下一頁",
              data: latestTrackConditions[index_1].msg,
            },
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "抖內",
              text: "我要抖內！",
            },
          },
        ],
      },
    };

    for (let index_2 = 0; index_2 < unitResults.length - 2; index_2++) {
      const house = unitResults[index_2];

      replyMessages.contents.contents.push({
        type: "bubble",
        hero: {
          type: "image",
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
          action: {
            type: "uri",
            uri:
              house.link ||
              "https://img1.591.com.tw/house/2022/06/13/165510489014780205.jpg!510x400.jpg",
          },
          url:
            house.imgLink ||
            "https://img1.591.com.tw/house/2022/06/13/165510489014780205.jpg!510x400.jpg",
          animated: true,
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: house.title,
              weight: "bold",
              size: "lg",
              margin: "none",
              wrap: false,
            },
            {
              type: "text",
              text: latestTrackConditions[index_1].msg,
              size: "1px",
              color: "#ffffff",
            },
            {
              type: "box",
              layout: "vertical",
              margin: "none",
              spacing: "sm",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  margin: "md",
                  contents: [
                    {
                      type: "text",
                      text: "租金",
                      color: "#999999",
                      flex: 1,
                      size: "md",
                    },
                    {
                      type: "text",
                      text: house.price.toString() + " 元",
                      margin: "none",
                      size: "sm",
                      flex: 5,
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "地址",
                      color: "#999999",
                      size: "md",
                      flex: 1,
                    },
                    {
                      type: "text",
                      text: house.location,
                      wrap: true,
                      color: "#666666",
                      size: "sm",
                      flex: 5,
                      margin: "none",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "房型",
                      color: "#999999",
                      size: "md",
                      flex: 1,
                    },
                    {
                      type: "text",
                      text: house.type,
                      wrap: true,
                      color: "#666666",
                      size: "sm",
                      flex: 5,
                      margin: "none",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "坪數",
                      color: "#999999",
                      size: "md",
                      flex: 1,
                    },
                    {
                      type: "text",
                      text: house.size.toString() + " 坪",
                      wrap: true,
                      color: "#666666",
                      size: "sm",
                      flex: 5,
                      margin: "none",
                    },
                  ],
                },
              ],
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "link",
              height: "sm",
              action: {
                type: "uri",
                label: "詳細資訊",
                uri: house.link,
                altUri: {
                  desktop: house.link,
                },
              },
            },
          ],
          flex: 0,
        },
      });
    }

    crawlerResults.push({ replyMessages, userId: unitResults.userId });
  }

  console.log(crawlerResults, "05 after map ");

  return crawlerResults;
}

module.exports = { track, check };
