import * as React from "react";
import Stack from "@mui/material/Stack";
import { Grid, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Button, CardActionArea } from "@mui/material";
import rentImg from "../Assets/rent.png";
import typeImg from "../Assets/type.png";
import magnifier from "../Assets/magnifier.png";
import locationImg from "../Assets/location.png";
import RentDialog from "./Components/RentDialog";
import LocationDialog from "./Components/LocationDialog";
import TypeDialog from "./Components/TypeDialog";
import SearchDialog from "./Components/SearchDialog";
import liff from "@line/liff";
const REACT_APP_LIFF_ID = process.env.REACT_APP_LIFF_ID;

export default function Page591() {
  const [minRent, setMinRent] = React.useState(0);
  const [maxRent, setMaxRent] = React.useState(0);
  const [type, setType] = React.useState([]);
  const [location, setLocation] = React.useState([]); // this the array of location name
  const [locationCode, setLocationCode] = React.useState([]); // this is the array of location code
  const [search, setSearch] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");

  async function initializeLIFF() {
    await liff.init({
      liffId: REACT_APP_LIFF_ID, // Use own liffId
      withLoginOnExternalBrowser: true, // Enable automatic login process
    });

    // Start to use liff's api
    console.log("liff initialized");
    if (!liff.isLoggedIn() && !liff.isInClient()) {
      window.alert("麻煩登入再來，掰掰！");
    } else {
      const profile = await liff.getProfile();
      setUserId(profile.userId);
      setDisplayName(profile.displayName);

      console.log(profile, " profile"); // print raw profile object
    }
  }
  initializeLIFF();

  const codes = {
    // this is the dictionary of location code
    1: "中正區",
    2: "大同區",
    3: "中山區",
    4: "松山區",
    5: "大安區",
    6: "萬華區",
    7: "信義區",
    8: "士林區",
    9: "北投區",
    10: "內湖區",
    11: "南港區",
    12: "文山區",
  };

  React.useEffect(() => {
    // get key of locationCode by matching codes and location
    for (let i = 0; i < location.length; i++) {
      for (let key in codes) {
        if (codes[key] === location[i]) {
          setLocationCode([...locationCode, key]);
        }
      }
    }

    console.log(locationCode, "locationCode");
  }, [location]);

  const [rentOpen, setRentOpen] = React.useState(false);
  const handleRentOpen = () => {
    setRentOpen(true);
    console.log("first");
  };

  const handleRentClose = (e) => {
    e.stopPropagation();
    setRentOpen(false);
    console.log("close");
  };

  const [locationOpen, setLocationOpen] = React.useState(false);
  const handleLocationOpen = () => {
    setLocationOpen(true);
    console.log("first");
  };

  const handleLocationClose = (e) => {
    e.stopPropagation();
    setLocationOpen(false);
    console.log("close");
  };

  const [typeOpen, setTypeOpen] = React.useState(false);
  const handleTypeOpen = () => {
    setTypeOpen(true);
    console.log("first");
  };

  const handleTypeClose = (e) => {
    e.stopPropagation();
    setTypeOpen(false);
    console.log("close");
  };

  const [searchOpen, setSearchOpen] = React.useState(false);
  const handleSearchOpen = () => {
    setSearchOpen(true);
    console.log("first");
  };

  const handleSearchClose = (e) => {
    e.stopPropagation();
    setSearchOpen(false);
    console.log("close");
  };

  return (
    <Grid container>
      <Grid item xs={1} md={4.5} />
      <Grid item xs={10} md={3}>
        <Stack sx={{ mt: 3 }} spacing={1}>
          <Typography variant="h5">591 條件篩選</Typography>
        </Stack>
        <Stack spacing={4} sx={{ mt: 2 }}>
          <Card sx={{ width: "100%", display: "flex" }}>
            <CardMedia
              sx={{
                width: "70px",
                height: "70px",
                margin: "10px",
                borderRadius: "10%",
              }}
              component="img"
              height="70"
              image={rentImg}
              alt="green iguana"
            />
            <CardActionArea onClick={handleRentOpen}>
              <CardContent>
                <RentDialog
                  rentOpen={rentOpen}
                  handleRentClose={handleRentClose}
                  minRent={minRent}
                  maxRent={maxRent}
                  setMinRent={setMinRent}
                  setMaxRent={setMaxRent}
                />
                <Typography variant="h6">租金範圍</Typography>
                <Typography variant="h9">
                  {minRent} ~ {maxRent} 元
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card sx={{ width: "100%", display: "flex" }}>
            <CardMedia
              sx={{
                width: "70px",
                height: "70px",
                margin: "10px",
                borderRadius: "10%",
              }}
              component="img"
              height="70"
              image={locationImg}
              alt="green iguana"
            />
            <CardActionArea onClick={handleLocationOpen}>
              <CardContent>
                <LocationDialog
                  locationOpen={locationOpen}
                  handleLocationClose={handleLocationClose}
                  location={location}
                  setLocation={setLocation}
                />
                <Typography variant="h6">房屋地區</Typography>
                <>
                  {location.map((name) => {
                    return <Typography variant="h9">{name} </Typography>;
                  })}
                </>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card sx={{ width: "100%", display: "flex" }}>
            <CardMedia
              sx={{
                width: "70px",
                height: "70px",
                margin: "10px",
                borderRadius: "10%",
              }}
              component="img"
              height="70"
              image={typeImg}
              alt="green iguana"
            />
            <CardActionArea onClick={handleTypeOpen}>
              <CardContent>
                <TypeDialog
                  typeOpen={typeOpen}
                  handleTypeClose={handleTypeClose}
                  type={type}
                  setType={setType}
                />
                <Typography variant="h6">房型種類</Typography>{" "}
                <>
                  {type.map((name) => {
                    return <Typography variant="h9">{name} </Typography>;
                  })}
                </>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card sx={{ width: "100%", display: "flex" }}>
            <CardMedia
              sx={{
                width: "70px",
                height: "70px",
                margin: "10px",
                borderRadius: "10%",
              }}
              component="img"
              height="70"
              image={magnifier}
              alt="green iguana"
            />
            <CardActionArea onClick={handleSearchOpen}>
              <CardContent>
                <SearchDialog
                  searchOpen={searchOpen}
                  handleSearchClose={handleSearchClose}
                  search={search}
                  setSearch={setSearch}
                />
                <Typography variant="h6">關鍵字</Typography>
                <Typography variant="h9">{search}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Stack>
      </Grid>
      <Grid item xs={1} md={4.5} />
      <Grid item xs={1} md={4.5} />
      <Grid item xs={10} md={3}>
        <Grid container>
          <Grid item xs={5} md={5}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                width: "100%",
                height: "50px",
                borderRadius: "3px",
                backgroundColor: "#4EADCB",
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
                marginTop: "20px",
                marginBottom: "20px",
              }}
              onClick={() => {
                liff
                  .sendMessages([
                    {
                      type: "image",
                      originalContentUrl: `https://i.imgur.com/MwS42AE.png?search?${search}&${minRent}&${maxRent}&${locationCode}&${type}&0?${userId}&${displayName}`,
                      previewImageUrl: "https://i.imgur.com/MwS42AE.png",
                    },
                  ])
                  .catch((error) => {
                    window.alert("Error sending message: " + error);
                  });
                liff.closeWindow();
                console.log(
                  `https://i.imgur.com/MwS42AE.png?search?${search}&${minRent}&${maxRent}&${locationCode}&${type}&0?${userId}&${displayName}`
                );
              }}
            >
              送出查詢
            </Button>
          </Grid>
          <Grid item xs={2} md={2} />
          <Grid item xs={5} md={5}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                width: "100%",
                height: "50px",
                borderRadius: "3px",
                backgroundColor: "#4EADCB",
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
                marginTop: "20px",
                marginBottom: "20px",
              }}
              onClick={() => {
                liff
                  .sendMessages([
                    {
                      type: "image",
                      originalContentUrl: `https://i.imgur.com/MwS42AE.png?track?${search}&${minRent}&${maxRent}&${locationCode}&${type}&0?${userId}&${displayName}`,
                      previewImageUrl: "https://i.imgur.com/MwS42AE.png",
                    },
                  ])
                  .catch((error) => {
                    window.alert("Error sending message: " + error);
                  });
                liff.closeWindow();
                console.log(
                  `https://i.imgur.com/MwS42AE.png?track?${search}&${minRent}&${maxRent}&${locationCode}&${type}&0?${userId}&${displayName}`
                );
              }}
            >
              設定爬蟲
            </Button>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          sx={{
            width: "100%",
            height: "50px",
            borderRadius: "3px",
            backgroundColor: "#CB4E4E",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
          }}
          onClick={() => {
            setMinRent(0);
            setMaxRent(0);
            setLocation([]);
            setType([]);
            setSearch("");
            setLocationCode([]);
          }}
        >
          清除條件
        </Button>
      </Grid>
      <Grid item xs={1} md={4.5} />
    </Grid>
  );
}
