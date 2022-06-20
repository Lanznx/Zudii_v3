const { search } = require("./Controller/Finders/Search");
const linebot = require("linebot");
const express = require("express");
const app = express();
require("dotenv").config();

// 用於辨識 Line Channel 的資訊
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

// 當有人傳送訊息給 line Bot:
bot.on("message", async (event) => {
  // event.message.text：使用者傳給 linebot 的訊息
  // event.reply(msg) 可以將回傳 msg 給使用者
  try{
    const replyMessage = await search(event.message.text);
    event.reply(replyMessage).then((data) => {
      console.log(data, "=== data ===");
    });
  }
  catch(err){
    console.log(err, "=== err ===");
    event.reply("不知道你在說什麼")
  }
});










port = 3000;
bot.listen("/linewebhook", port, () => {
  console.log(`🧨🧨🧨🧨🧨🧨🧨🧨 lineBot listen on ${port} 🧨🧨🧨🧨🧨🧨🧨🧨`);
});
