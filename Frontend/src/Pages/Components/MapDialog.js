import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";

import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";

import SelectType from "./SelectType";

import { getNearByHouses } from "../APIs";

export default function MapDialog(props) {
  const { openDialog, setOpenDialog, handleDialogClose, coordinates, userId } = props;
  const [minRent, setMinRent] = React.useState(0);
  const [maxRent, setMaxRent] = React.useState(0);
  const [size, setSize] = React.useState(0);
  const [type, setType] = React.useState([""]);
  const [releaseTime, setReleaseTime] = React.useState([
    parseInt(new Date().getFullYear()),
    parseInt(new Date().getMonth() + 1),
    parseInt(new Date().getDate()) - 1,
  ]);

  const monthDays = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
  };
  let year = 2021;
  let month = 1;
  let day = 1;
  let years = [];
  let months = [];
  let days = [];
  for (let i = 0; i < 4; i++) {
    years.push(year + i);
  }
  for (let i = 0; i < 12; i++) {
    months.push(month + i);
  }
  for (let i = 0; i < monthDays[month]; i++) {
    days.push(day + i);
  }

  return (
    <Dialog open={openDialog} onClose={handleDialogClose} fullWidth>
      <DialogTitle variant="primary" color="primary">
        地圖檢索
      </DialogTitle>
      <DialogContent>
        <DialogContentText>請輸入租金範圍</DialogContentText>
        <Grid
          container
          spacing={2}
          sx={{
            alignContent: "center",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Grid item xs={5} >
            <TextField
              autoFocus
              sx={{
                width: "100%",
              }}
              id="minRent"
              value={minRent}
              onChange={(e) => {
                console.log(e.target.value, "minmin")
                setMinRent(e.target.value);
              }}
              label="最低"
              type="number"
            />
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" align="center">
              -
            </Typography>
          </Grid>
          <Grid item xs={5} >
            <TextField
              autoFocus
              sx={{
                width: "100%",
              }}
              id="maxRent"
              value={maxRent}
              onChange={(e) => {
                console.log(e.target.value, "mMAX")
                setMaxRent(e.target.value);
              }}
              label="最高"
              type="number"
            />
          </Grid>
        </Grid>

        <DialogContentText sx={{
          marginTop: "20px",
          marginBottom: "10px",
        }}>請選擇房型</DialogContentText>
        <SelectType type={type} setType={setType} />


        <DialogContentText
          sx={{
            marginTop: "20px",
            marginBottom: "10px",
          }}
        >請選擇最早釋出時間</DialogContentText>
        <Grid
          container
          spacing={2}
          sx={{
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <Grid item xs={4}>
            <FormControl sx={{ width: 90, mt: 1 }}>
              <Grid item xs={3}>
                <InputLabel id="year-label">年</InputLabel>
                <Select
                  label="年"
                  id="year"
                  value={releaseTime[0]}
                  onChange={(e) => {
                    console.log(e.target.value, "year");
                    setReleaseTime([
                      e.target.value,
                      releaseTime[1],
                      releaseTime[2],
                    ]);
                  }}
                  sx={{ mt: "10px", width: "90px" }}
                >
                  {years.map((year) => {
                    return (
                      <MenuItem value={year} key={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl sx={{ width: 90, mt: 1 }}>
              <Grid item xs={3}>
                <InputLabel id="month-label">月</InputLabel>
                <Select
                  label="月"
                  id="month"
                  value={releaseTime[1]}
                  onChange={(e) => {
                    console.log(e.target.value, "month");
                    setReleaseTime([
                      releaseTime[0],
                      e.target.value,
                      releaseTime[2],
                    ]);
                  }}
                  sx={{ mt: "10px", width: "90px" }}
                >
                  {months.map((month) => {
                    return (
                      <MenuItem value={month} key={month}>
                        {month}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl sx={{ width: 90, mt: 1 }}>
              <Grid item xs={3}>
                <InputLabel id="day-label">日</InputLabel>
                <Select
                  label="日"
                  id="day"
                  value={releaseTime[2]}
                  onChange={(e) => {
                    setReleaseTime([
                      releaseTime[0],
                      releaseTime[1],
                      e.target.value,
                    ]);
                  }}
                  sx={{ mt: "10px", width: "90px" }}
                >
                  {days.map((day) => {
                    return (
                      <MenuItem value={day} key={day}>
                        {day}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>
            </FormControl>
          </Grid>
        </Grid>


        <DialogContentText
          sx={{
            marginTop: "20px",
            marginBottom: "10px",
          }}
        >請輸入最小坪數</DialogContentText>
        <Grid
          container
          spacing={2}
          sx={{
            marginTop: "10px",
          }}
        >
          <Grid item xs={5} >
            <TextField
              autoFocus
              sx={{
                width: "100%",
              }}
              id="size"
              value={size}
              onChange={(e) => {
                setSize(e.target.value);
              }}
              label="最小坪數"
              type="number"
            />
          </Grid>
        </Grid>



      </DialogContent>
      <DialogActions sx={{
        justifyContent: "center",
      }}>
        <Button onClick={()=>{
          getNearByHouses({
            minRent,
            maxRent,
            type,
            releaseTime,
            size,
            coordinates,
            userId,
          });
        }} sx={{
          color: "#fff",
          backgroundColor: "primary.main",
        }}>
          送出
        </Button>
      </DialogActions>
    </Dialog>
  );
}
