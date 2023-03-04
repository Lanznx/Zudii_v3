const getNearByHouses = async (query) => {
  const response = await fetch(`${process.env.REACT_APP_BASE_URL}/houses/nearby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });
  const data = await response.json();
  return data;
}

export { getNearByHouses }