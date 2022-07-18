const { search } = require("./Controller/Finder");
const { track, check } = require("./Controller/Tracker");
const { getUserAccessToken } = require("./Controller/Notifyer");
const { bot, lineClient } = require("./util/linebot");
const express = require("express");
const app = express();
const finderRoutes = require("./Routes/Find.js");
const notifyRoutes = require("./Routes/Notify");
const path = require("path");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/find", finderRoutes);
app.use("/notify", notifyRoutes);

let visitor_number = 0;
app.get("/", (req, res) => {
  visitor_number++;
  res.send(`Wazzzaaapppp \nYou are visitor no.${visitor_number}`);
});

// https://i.imgur.com/MwS42AE.png    ?       search    ?      title & minRent & maxRent & locationCodes & types & firstRow & convertedTime & distanceMRT      ?       userID & displayNAME

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
            releaseTime: cleanData[6],
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
            releaseTime: cleanData[6],
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
      "&" +
      cleanData[6] +
      "?" +
      userInfo[0] +
      "&" +
      userInfo[1];
    console.log(nextMsg, "=========== nextMsg ===========");
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
        releaseTime: cleanData[6],
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

async function autoCheck() {
  console.log("cron is working");
  try {
    const crawlerResults = await check();
    for (let index_1 = 0; index_1 < crawlerResults.length; index_1++) {
      const r = crawlerResults[index_1];
      if (r.push_messages !== null) {
        const token = await getUserAccessToken(r.userId);
        console.log(token, "ACCESS_TOKEN");
        for (let index_2 = 0; index_2 < r.push_messages.length; index_2++) {
          const push_message = r.push_messages[index_2];
          await setTimeout(
            () => pushToUser(push_message, token),
            index_2 * 300
          );
        }
      } else console.log("這人的爬蟲條件沒被滿足！");
    }
  } catch (err) {
    console.log(err);
  }
}

function pushToUser(push_message, token) {
  axios
    .post("https://notify-api.line.me/api/notify", `message=${push_message}`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res.data, "message pushed!!!");
    })
    .catch((err) => {
      console.log(err.data, "err");
    });
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
