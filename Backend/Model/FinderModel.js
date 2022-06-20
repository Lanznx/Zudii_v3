const { collection } = require("../util/MongoDB");
async function searcher(text) {
  let query = {
    title: {
      $regex: text,
      $options: "i",
    },
  };
  const result = await collection.find(query).skip(0).limit(10).toArray();
  if (result.length === 0) {
    result.push({ id_591: null });
    console.log(result);
  }
  return result;
}

module.exports = {
  searcher,
};
