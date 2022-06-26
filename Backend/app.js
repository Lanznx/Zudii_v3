const { search } = require("./Controller/Finder");
const { track, check } = require("./Controller/Tracker");
const { bot, lineClient } = require("./util/linebot");
const express = require("express");
const app = express();
const finderRoutes = require("./Routes/Find.js");
const path = require("path");
const cors = require("cors");
const cron = require("node-cron");

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/find", finderRoutes);

let visitor_number = 0;
app.get("/", (req, res) => {
  visitor_number++;
  res.send(`Wazzzaaapppp \nYou are visitor no.${visitor_number}`);
});

// https://i.imgur.com/MwS42AE.png?search?木柵&5000&10000&['1','2']&['整層住家','獨立套房']&0?userIDIDIDIDI&displayNAME

bot.on("message", async (event) => {
  try {
    if (event.message.text == "我要抖內！") {
      event
        .reply(
          "可以點擊下方連結轉帳給我呦！\nhttps://www.jkopay.com/transfer?j=Transfer:906614325"
        )
        .then((data) => {
          console.log(data, "=== data ===");
        });
    }
    if (event.message.contentProvider !== undefined) {
      const msg = event.message.contentProvider.originalContentUrl;
      const content = msg.split("?");

      if (content[1] === "search") {
        const cleanData = content[2].split("&");
        const userInfo = content[3].split("&");
        console.log(cleanData, " cleanData");
        console.log(cleanData[3], "locationcodes!!!");
        let request = {
          body: {
            text: cleanData[0],
            price1: parseInt(cleanData[1]),
            price2: parseInt(cleanData[2]),
            locaitonCodes:
              cleanData[3].split(",").map((item) => {
                return parseInt(item);
              }) || parseInt(cleanData[3]),
            types: cleanData[4].split(","),
            firstRow: parseInt(cleanData[5]),
            userId: userInfo[0],
            displayName: userInfo[1],
            msg: msg,
          },
        };
        if (cleanData[3] === "" || cleanData[3] === "Nan")
          request.body.locaitonCodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        if (cleanData[4] === "")
          request.body.types = [
            "整層住家",
            "獨立套房",
            "分租套房",
            "雅房",
            "其他",
            "車位",
          ];
        const replyMessage = await search(request, null);
        event.reply(replyMessage).then((data) => {
          console.log(data, "=== data ===");
        });
      } else if (content[1] === "track") {
        const cleanData = content[2].split("&");
        const userInfo = content[3].split("&");
        let request = {
          body: {
            text: cleanData[0],
            price1: parseInt(cleanData[1]),
            price2: parseInt(cleanData[2]),
            locaitonCodes:
              cleanData[3].split(",").map((item) => {
                return parseInt(item);
              }) || parseInt(cleanData[3]),
            types: cleanData[4].split(","),
            firstRow: parseInt(cleanData[5]),
            userId: userInfo[0],
            displayName: userInfo[1],
          },
        };
        if (cleanData[3] === "" || cleanData[3] === "Nan")
          request.body.locaitonCodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        if (cleanData[4] === "")
          request.body.types = [
            "整層住家",
            "獨立套房",
            "分租套房",
            "雅房",
            "其他",
            "車位",
          ];
        const replyMessage = await track(request, null);
        event.reply(replyMessage).then((data) => {
          console.log(data, "=== data ===");
        });
      }
    }
  } catch (err) {
    console.log(err, "=== err ===");
    event.reply("不知道你在說什麼");
  }
});

bot.on("postback", async (event) => {
  const msg = event.postback.data;
  console.log(msg, "original MSG");
  const content = msg.split("?");
  console.log(content, "content");

  if (content[1] === "search") {
    const cleanData = content[2].split("&");
    console.log(cleanData, " cleanData");
    console.log(cleanData[3], "locationcodes!!!");
    const userInfo = content[3].split("&");
    const nextMsg =
      "https://i.imgur.com/MwS42AE.png?search?" +
      cleanData[0] +
      "&" +
      cleanData[1] +
      "&" +
      cleanData[2] +
      "&" +
      cleanData[3] +
      "&" +
      cleanData[4] +
      "&" +
      (parseInt(cleanData[5]) + 10).toString() +
      "?" +
      userInfo[0] +
      "&";
    userInfo[1];
    console.log(nextMsg, "=========== nextnsg ===========");
    let request = {
      body: {
        text: cleanData[0],
        price1: parseInt(cleanData[1]),
        price2: parseInt(cleanData[2]),
        locaitonCodes:
          cleanData[3].split(",").map((item) => {
            return parseInt(item);
          }) || parseInt(cleanData[3]),
        types: cleanData[4].split(","),
        firstRow: parseInt(cleanData[5]) + 10,
        userId: userInfo[0],
        displayName: userInfo[1],
        msg: nextMsg,
      },
    };
    if (cleanData[3] === "" || cleanData[3] === "Nan")
      request.body.locaitonCodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    if (cleanData[4] === "")
      request.body.types = [
        "整層住家",
        "獨立套房",
        "分租套房",
        "雅房",
        "其他",
        "車位",
      ];
    console.log(request, "========   postback ==========");
    const replyMessage = await search(request, null);
    event.reply(replyMessage).then((data) => {
      console.log(data, "=== data ===");
    });
  }
});

// TO_DO:

const message = {
  type: "text",
  text: "Hello World!",
};

async function autoCheck() {
  console.log("cron is working");
  try {
    const crawlerResults = await check();
    crawlerResults.map((r) => {
      if (r.replyMessages !== null) {
        lineClient
          .pushMessage(r.userId, r.replyMessages)
          .then((data) => console.log(data))
          .catch((err) => console.log(err));
      } else console.log("這人的爬蟲條件沒被滿足！");
    });
  } catch (err) {
    console.log(err);
  }
}

cron.schedule("* * * * *", autoCheck);

serverPort = 4500;
app.listen(serverPort, () => {
  console.log(`🔥🔥🔥 hi, your server is running on port ${serverPort} 🔥🔥🔥`);
});

port = 5000;
bot.listen("/linewebhook", port, () => {
  console.log(`🧨🧨🧨🧨🧨🧨🧨🧨 lineBot listen on ${port} 🧨🧨🧨🧨🧨🧨🧨🧨`);
});
