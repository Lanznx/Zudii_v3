const getNearByHouses = async (query) => {
  console.log(query, "query")

  const response = await fetch(`${process.env.REACT_APP_BASE_URL}/map`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });
  const data = await response.json();
  console.log(data, "data")
  return data;
}

async function loadNearByHouses(map, houseQuery) {
  if(houseQuery["maxRent"] === 0) houseQuery["maxRent"] = 100000000
  if(houseQuery["type"][0] === "") houseQuery["type"] = ["整層住家", "獨立套房", "雅房", "分租套房", "車位", "其他"]
  const houses = await getNearByHouses(houseQuery)
  const housesFeatures = houses.map((house) => {
    return {
      'type': 'Feature',
      'properties': {
        "description": `<img src=${house["imgLink"]} width="100%"/>
        <p>坪數：${house["size"]} 坪</p>
        <p>租金：${house["rent"]}</p>
        <p>房型：${house["type"]}</p>
        <p>上架日：${house["releaseTime"]}</p>
        <a href=${house["shortUrl"]}>詳細資訊</a>`,
      },
      'geometry': {
        'type': 'Point',
        'coordinates': house["coordinates"]
      }
    }
  })
  const places = map.current.getSource('places');
  places.setData({
    type: 'FeatureCollection',
    features: housesFeatures,
  })
}

export { getNearByHouses, loadNearByHouses }