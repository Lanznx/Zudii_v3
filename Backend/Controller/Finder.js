const { searcher } = require("../Model/FinderModel");

async function search(req, res) {
  const conditions = {
    text: req.body.text || "",
    price1: req.body.price1 || 0,
    price2: req.body.price2 || 100000000,
    locaitonCodes: req.body.locaitonCodes,
    types: req.body.types,
    firstRow: req.body.firstRow || 0,
    batch: req.body.batch || null
  };
  console.log(conditions, "============ conditions ===============");
  const userInfo = {
    userId: req.body.userId,
    displayName: req.body.displayName,
  };

  const houses = await searcher(conditions, userInfo);

  if (houses[0].id_591 === null) {
    return "查無資料";
  } else {
    let replyMessages = {
      type: "flex",
      altText: `${conditions.text} 的結果`,
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
              data: req.body.msg,
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

    houses.map((house) => {
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
              text: req.body.msg,
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
    });
    console.log(replyMessages, "============= replyMessages ===============");
    return replyMessages;
  }
}
module.exports = { search };