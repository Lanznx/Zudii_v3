import * as React from "react";
import { Chip, CircularProgress, Grid, IconButton } from "@mui/material";
import liff from "@line/liff";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import "../index.css"
import 'mapbox-gl/dist/mapbox-gl.css';
import MapDialog from "./Components/MapDialog";
import { getNearByHouses, loadNearByHouses } from "./APIs";

mapboxgl.accessToken = 'pk.eyJ1IjoibGFuem54IiwiYSI6ImNsNzJ2bWRicjB6NDUzcHA2djY5OHRha2sifQ.fz8PcF3zTbKsAjgXFQ4zqA';
const REACT_APP_LIFF_DIRECT_ID = process.env.REACT_APP_LIFF_DIRECT_ID;

export default function PageMap() {
  const [userId, setUserId] = React.useState("");
  const map = React.useRef(null);
  const mapContainer = React.useRef(null);

  const [lng, setLng] = React.useState(121.57);
  const [lat, setLat] = React.useState(24.99);
  const [userLng, setUserLng] = React.useState(121.56);
  const [userLat, setUserLat] = React.useState(25);
  const [zoom, setZoom] = React.useState(15);
  const [loading, setLoading] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [houseQuery, setHouseQuery] = React.useState({});
  const [canQuickSearch, setCanQuickSearch] = React.useState(false);
  const [amountOfHouses, setAmountOfHouses] = React.useState(0);
  const handleDialogClose = (e) => {
    e.stopPropagation();
    setOpenDialog(false);
  };
  const handleDialogOpen = (e) => {
    setOpenDialog(true);
  };

  React.useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
    setUserPosition();
    initHouses();
  });

  React.useEffect(() => {
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  React.useEffect(() => {
    flyToUserLocation();
  }, [userLng, userLat]);

  function initHouses() {
    map.current.on('load', async () => {
      setLoading(true);
      const houses = await getNearByHouses({
        coordinates: [userLng, userLat],
        minRent: 0,
        maxRent: 100000000,
        type: ["整層住家", "獨立套房", "雅房", "分租套房", "車位", "其他"],
        userId: userId,
        releaseTime: "2020-01-01",
        size: 0,
      })
      setAmountOfHouses(houses.length);
      setLoading(false);
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

      map.current.addSource('places', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: housesFeatures,
        }
      })

      map.current.addLayer({
        'id': 'places',
        'type': 'circle',
        'source': 'places',
        'paint': {
          'circle-radius': 10,
          'circle-stroke-width': 2,
          'circle-color': 'rgba(100, 149, 237, 1)',
          'circle-stroke-color': 'white'
        },
      });

      map.current.on('click', 'places', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup({ className: 'mapboxgl-popup' })
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map.current);
      });
    })
  }

  function getUserPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async function setUserPosition() {
    try {
      const position = await getUserPosition();
      const { latitude, longitude } = position.coords;
      setUserLng(longitude);
      setUserLat(latitude);
    } catch (error) {
      alert("無法取得您的位置，請確認您的瀏覽器是否開啟定位功能。")
    }
  }


  async function flyToUserLocation() {
    try {
      map.current.flyTo({
        center: [userLng, userLat],
        zoom: 15,
        essential: true
      });
    } catch (error) {
      alert("無法取得您的位置，請確認您的瀏覽器是否開啟定位功能。")
    }
  }

  async function initializeLIFF() {
    await liff.init({
      liffId: REACT_APP_LIFF_DIRECT_ID, // Use own liffId
      withLoginOnExternalBrowser: true, // Enable automatic login process
    });

    // Start to use liff's api
    if (!liff.isLoggedIn() && !liff.isInClient()) {
      window.alert("麻煩登入再來，掰掰！");
    } else {
      const profile = await liff.getProfile();
      setUserId(profile.userId);
    }
  }

  React.useEffect(() => {
    // initializeLIFF();
  }, []);

  return (
    <Grid container sx={{
      overflow: "hidden",
    }}>
      <CircularProgress sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        color: "primary.main",
        zIndex: (theme) => loading ? theme.zIndex.drawer + 1 : -1,
      }}
        color="inherit" />
      <Grid item xs={12} sx={{
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
      }}>
        <Chip sx={{
          position: "absolute",
          top: "7%",
          zIndex: (theme) => loading ? theme.zIndex.drawer - 1 : +1,
          backgroundColor: "rgba(100, 149, 237, 0.9)",
          color: "#fff",
        }}
          label={`查到 ${amountOfHouses} 筆資料`}
        />
      </Grid>

      <Grid item xs={12} sx={{
        mt: 0,
        display: "flex",
        justifyContent: "center",
      }}>
        <div style={{
          "backgroundColor": "rgba(100, 149, 237, 0.9)",
          "color": "#fff",
          "padding": "6px 12px",
          "fontFamily": "monospace",
          "zIndex": "1",
          "position": "absolute",
          "margin": "12px",
          "marginTop": "12px",
          "borderRadius": "4px",
          "alignContent": "center",
        }}>
          Longitude: {Math.round(lng * 100) / 100} | Latitude: {Math.round(lat * 100) / 100}
        </div>

        <div style={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
        }}>
          <div ref={mapContainer} style={{
            height: '120vh',
            width: '100vw',
          }} />
        </div>
        <MapDialog
          openDialog={openDialog}
          handleDialogClose={handleDialogClose}
          coordinates={[lng, lat]}
          userId={userId}
          setHouseQuery={setHouseQuery}
          map={map}
          setCanQuickSearch={setCanQuickSearch}
          setLoading={setLoading}
          setAmountOfHouses={setAmountOfHouses}
        />
        <IconButton onClick={flyToUserLocation}
          color="primary"
          size="large"
          sx={{
            backgroundColor: "white",
            '&:hover': {
              backgroundColor: "white",
            },
            position: 'absolute',
            bottom: 160,
            right: 16,
            zIndex: "3",
          }}>

          <MyLocationIcon />
        </IconButton>
        <IconButton onClick={handleDialogOpen}
          color="primary"
          size="large"
          sx={{
            backgroundColor: "white",
            '&:hover': {
              backgroundColor: "white",
            },
            position: 'absolute',
            bottom: 100,
            right: 16,
            zIndex: "3",
          }}
        >
          <SearchIcon />
        </IconButton>

        <IconButton onClick={async () => {
          setHouseQuery({
            coordinates: [lng, lat],
            minRent: houseQuery['minRent'],
            maxRent: houseQuery['maxRent'],
            type: houseQuery['type'],
            userId: houseQuery['userId'],
            releaseTime: houseQuery['releaseTime'],
            size: houseQuery['size'],
          })
          setLoading(true)
          const amount = await loadNearByHouses(map, houseQuery)
          setAmountOfHouses(amount)
          setLoading(false)
        }}
          disabled={!canQuickSearch}
          color="primary"
          size="large"
          sx={{
            backgroundColor: "white",
            '&:hover': {
              backgroundColor: "white",
            },
            position: 'absolute',
            bottom: 40,
            right: 16,
            zIndex: "3",
          }}
        >
          <FindReplaceIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}
