const { search } = require("./Controller/Finders/Search");
const linebot = require("linebot");
const express = require("express");
const app = express();
const finderRoutes = require("./Routes/Find.js");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

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

// 用於辨識 Line Channel 的資訊
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

// https://i.imgur.com/MwS42AE.png?search?木柵&5000&10000&['1','2']&['整層住家','獨立套房']&0?userIDIDIDIDI&displayNAME

// 當有人傳送訊息給 line Bot:
bot.on("message", async (event) => {
  // event.message.text：使用者傳給 linebot 的訊息
  // event.reply(msg) 可以將回傳 msg 給使用者
  try {
    const msg = event.message.contentProvider.originalContentUrl;
    const content = msg.split("?");
    const userInfo = content[3];
    console.log(msg);
    console.log(content);
    if (content[1] === "search") {
      const cleanData = content[2].split("&");
      let request = {
        body: {
          text: cleanData[0],
          price1: parseInt(cleanData[1]),
          price2: parseInt(cleanData[2]),
          locaitonCodes: parseInt(cleanData[3].split(",")),
          types: cleanData[4].split(","),
          firstRow: parseInt(cleanData[5]),
          userId: userInfo.split("&")[0],
          displayName: userInfo.split("&")[1],
          msg: msg,
        },
      };

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
    }
  } catch (err) {
    console.log(err, "=== err ===");
    event.reply("不知道你在說什麼");
  }
});

serverPort = 4500;
app.listen(serverPort, () => {
  console.log(`🔥🔥🔥 hi, your server is running on port ${serverPort} 🔥🔥🔥`);
});

port = 5000;
bot.listen("/linewebhook", port, () => {
  console.log(`🧨🧨🧨🧨🧨🧨🧨🧨 lineBot listen on ${port} 🧨🧨🧨🧨🧨🧨🧨🧨`);
});
