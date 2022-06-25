const { tracker, checkNewHouses } = require("../Model/TrackerModel");
const cron = require("node-cron")


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


async function check(){

}




cron.schedule("* * * * *", ()=>{
    console.log("cron is working")
})


module.exports = { track };
