import * as React from "react";
import Stack from "@mui/material/Stack";
import { Grid, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Button, CardActionArea } from "@mui/material";
import rentImg from "../Assets/rent.png";
import typeImg from "../Assets/type.png";
import timeImg from "../Assets/time.png";
import magnifier from "../Assets/magnifier.png";
import locationImg from "../Assets/location.png";
import RentDialog from "./Components/RentDialog";
import LocationDialog from "./Components/LocationDialog";
import TypeDialog from "./Components/TypeDialog";
import SearchDialog from "./Components/SearchDialog";
import ReleaseTimeDialog from "./Components/ReleaseTimeDialog";
import liff from "@line/liff";
const REACT_APP_LIFF_ID = process.env.REACT_APP_LIFF_ID;
const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL;
const provinces = require("../Assets/provinces.json");

export default function Page591() {
  const [minRent, setMinRent] = React.useState(0);
  const [maxRent, setMaxRent] = React.useState(0);
  const [type, setType] = React.useState([]);
  const [regions, setRegions] = React.useState([]);
  const [regionCode, setRegionCode] = React.useState([]);
  const [sections, setSections] = React.useState([]);
  const [sectionCode, setSectionCode] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [distanceMRT, setDistanceMRT] = React.useState(1000);
  const [releaseTime, setReleaseTime] = React.useState([
    parseInt(new Date().getFullYear()),
    parseInt(new Date().getMonth() + 1),
    parseInt(new Date().getDate()) - 1,
  ]);
  const [chosedTime, setChosedTime] = React.useState("");
  const [searchMesasge, setSearchMessage] = React.useState("");
  const [trackMessage, setTrackMessage] = React.useState("");

  React.useEffect(() => {
    if (userId === "") {
      return
    }
    fetch(REACT_APP_BASE_URL + "find/myCondition", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    }).then((res) => {
      return res.json()
    }).then((response) => {
      console.log(response, " ========= response ========")
      if (response.success) {
        console.log(response.data, "=========== response.datas ==============")
        setMinRent(response.data.minRent);
        setMaxRent(response.data.maxRent);
        setType(response.data.types);
        setRegionCode(response.data.region);
        setSectionCode(response.data.sections);
        setSearch(response.data.title);
        setDistanceMRT(response.data.distanceMRT);
        convertCodesToSectionsAndRegions(response.data.region, response.data.sections);
      };
    });
  }, [userId])

  React.useEffect(() => {
    setSearchMessage(
      `https://i.imgur.com/MwS42AE.png?search?${search}&${minRent}&${maxRent}&${regionCode}&${type}&0&${chosedTime}&${distanceMRT}&${sectionCode}?${userId}&${displayName}`
    );
    setTrackMessage(
      `https://i.imgur.com/MwS42AE.png?track?${search}&${minRent}&${maxRent}&${regionCode}&${type}&0&${chosedTime}&${distanceMRT}&${sectionCode}?${userId}&${displayName}`
    );
  }, [
    search,
    minRent,
    maxRent,
    regionCode,
    type,
    chosedTime,
    distanceMRT,
    sectionCode,
    userId,
    displayName,
  ]);


  async function initializeLIFF() {
    await liff.init({
      liffId: REACT_APP_LIFF_ID, // Use own liffId
      withLoginOnExternalBrowser: true, // Enable automatic login process
    });

    // Start to use liff's api
    if (!liff.isLoggedIn() && !liff.isInClient()) {
      window.alert("麻煩登入再來，掰掰！");
    } else {
      const profile = await liff.getProfile();
      setUserId(profile.userId);
      profile.displayName = profile.displayName.replace(" ", "");
      setDisplayName(profile.displayName);
    }
  }
  initializeLIFF();

  React.useEffect(() => {
    console.log(releaseTime, " releaseTime");
    let newTime = "";

    for (let i = 0; i < releaseTime.length; i++) {
      const item = releaseTime[i];
      if (i === 0) {
        newTime += item.toString();
      } else {
        newTime += "-" + item.toString();
      }
    }
    if (new Date(newTime).getTime() > new Date().getTime()) {
      alert("你在嘗試搜尋未來");
      setReleaseTime([
        parseInt(new Date().getFullYear()),
        parseInt(new Date().getMonth() + 1),
        parseInt(new Date().getDate()),
      ]);
    } else {
      setChosedTime(newTime);
    }
  }, [releaseTime]);

  async function convertCodesToSectionsAndRegions(regions, sections) {
    let convertedRegions = [];
    let convertedSections = [];

    regions.forEach(region => {
      provinces['cities'].forEach(province => {
        if (province.region === region) {
          convertedRegions.push(province.name);
        }
        sections.forEach(user_section => {
          province.sections.forEach((province_section) => {
            if (user_section === province_section.section) {
              convertedSections.push(province_section.name);
            }
          })
        });
      })
    });
    setRegions(convertedRegions);
    setSections(convertedSections);
  }

  React.useEffect(() => {
    // get key of sectionCode by matching codes and section

    let newRegionCode = [];
    let newSectionCode = [];

    provinces["cities"].map((city) => {
      if (city.name === regions[0]) {
        newRegionCode.push(city.region);
        setRegionCode(newRegionCode);
        city.sections.map((section) => {
          sections.map((s) => {
            if (section.name === s) {
              newSectionCode.push(section.section);
              setSectionCode(newSectionCode);
            }
          });
        });
      }
    });
  }, [sections, regions]);

  const [rentOpen, setRentOpen] = React.useState(false);
  const handleRentOpen = () => {
    setRentOpen(true);
  };

  const handleRentClose = (e) => {
    e.stopPropagation();
    setRentOpen(false);
  };

  const [locationOpen, setLocationOpen] = React.useState(false);
  const handleLocationOpen = () => {
    setLocationOpen(true);
  };

  const handleLocationClose = (e) => {
    e.stopPropagation();
    setLocationOpen(false);
  };

  const [typeOpen, setTypeOpen] = React.useState(false);
  const handleTypeOpen = () => {
    setTypeOpen(true);
  };

  const handleTypeClose = (e) => {
    e.stopPropagation();
    setTypeOpen(false);
  };

  const [searchOpen, setSearchOpen] = React.useState(false);
  const handleSearchOpen = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = (e) => {
    e.stopPropagation();
    setSearchOpen(false);
  };

  const [releaseTimeOpen, setReleaseTimeOpen] = React.useState(false);
  const handleReleaseTimeOpen = () => {
    setReleaseTimeOpen(true);
  };

  const handleReleaseTimeClose = (e) => {
    e.stopPropagation();
    setReleaseTimeOpen(false);
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
                <Typography variant="h7">
                  {minRent} ~ {maxRent} 元
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card sx={{ width: "100%", display: "flex" }}>
            <CardMedia
              sx={{
                width: "80px",
                height: "80px",
                margin: "10px",
                borderRadius: "10%",
              }}
              component="img"
              height="75px"
              image={locationImg}
            />
            <CardActionArea onClick={handleLocationOpen}>
              <CardContent>
                <LocationDialog
                  locationOpen={locationOpen}
                  handleLocationClose={handleLocationClose}
                  regions={regions}
                  setRegions={setRegions}
                  sections={sections}
                  setSections={setSections}
                  provinces={provinces}
                  distanceMRT={distanceMRT}
                  setDistanceMRT={setDistanceMRT}
                />
                <Typography variant="h6">房屋地區及交通</Typography>
                <>
                  {regions.map((name) => {
                    return (
                      <Typography variant="h7" sx={{ fontWeight: "bold" }}>
                        {name}{" "}
                      </Typography>
                    );
                  })}
                </>
                <br />
                <>
                  {sections.map((name) => {
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
                    return <Typography variant="h7">{name} </Typography>;
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
              height="200"
              image={timeImg}
              alt="green iguana"
            />
            <CardActionArea onClick={handleReleaseTimeOpen}>
              <CardContent>
                <ReleaseTimeDialog
                  releaseTimeOpen={releaseTimeOpen}
                  handleReleaseTimeClose={handleReleaseTimeClose}
                  releaseTime={releaseTime}
                  setReleaseTime={setReleaseTime}
                />
                <Typography variant="h6">貼文時間</Typography>
                <Typography variant="h7">{chosedTime}</Typography>
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
                <Typography variant="h7">{search}</Typography>
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
              sx={{
                width: "100%",
                height: "50px",
                borderRadius: "3px",
                backgroundColor: "#CB4E4E",
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
                marginTop: "20px",
                marginBottom: "20px",
              }}
              onClick={() => {
                setMinRent(0);
                setMaxRent(0);
                setType([]);
                setSections([]);
                setSearch("");
              }}
            >
              清除條件
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
                if (regions.length === 0) {
                  alert("請選擇縣市");
                  return;
                } else if (sectionCode.length === 0) {
                  let newSectionCode = [];

                  provinces["cities"].map((city) => {
                    if (city.name === regions[0]) {
                      city.sections.map((section) => {
                        newSectionCode.push(section.section);
                      });
                    }
                    setSectionCode(newSectionCode);
                  });
                  alert("麻煩再按一次");
                  return;
                }

                liff
                  .sendMessages([
                    {
                      type: "image",
                      originalContentUrl: searchMesasge,
                      previewImageUrl: "https://i.imgur.com/MwS42AE.png",
                    },
                  ])
                  .catch((error) => {
                    window.alert("Error sending message: " + error);
                  });
                liff.closeWindow();
              }}
            >
              送出查詢
            </Button>
          </Grid>
        </Grid>
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
          }}
          onClick={() => {
            if (regions.length === 0) {
              alert("請選擇縣市");
              return;
            } else if (sectionCode.length === 0) {
              let newSectionCode = [];

              provinces["cities"].map((city) => {
                if (city.name === regions[0]) {
                  city.sections.map((section) => {
                    newSectionCode.push(section.section);
                  });
                }
                setSectionCode(newSectionCode);
              });
              alert("麻煩再按一次");
              return;
            }
            liff
              .sendMessages([
                {
                  type: "image",
                  originalContentUrl: trackMessage,
                  previewImageUrl: "https://i.imgur.com/MwS42AE.png",
                },
              ])
              .catch((error) => {
                window.alert("Error sending message: " + error);
              });
            liff.closeWindow();
          }}
        >
          有符合的房屋時通知我
        </Button>
      </Grid>
      <Grid item xs={1} md={4.5} />
    </Grid>
  );
}
