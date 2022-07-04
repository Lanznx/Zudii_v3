import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Grid, Stack } from "@mui/material";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function ReleaseTimedialog(props) {
  const {
    releaseTimeOpen,
    handleReleaseTimeClose,
    setReleaseTime,
    releaseTime,
    monthDays,
  } = props;
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
    <Dialog open={releaseTimeOpen} onClose={handleReleaseTimeClose} fullWidth>
      <DialogTitle variant="primary" color="primary">
        貼文時間
      </DialogTitle>
      <DialogContent>
        <DialogContentText>請輸入貼文最早時間</DialogContentText>
        <Grid container sx={{ direction: "revert" }}>
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
                sx={{ mt: "10px", width: "85px" }}
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
                sx={{ mt: "10px", width: "85px" }}
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
                sx={{ mt: "10px", width: "85px" }}
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
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(e) => {
            setReleaseTime([
              parseInt(new Date().getFullYear()),
              parseInt(new Date().getMonth() + 1),
              parseInt(new Date().getDate()),
            ]);
            handleReleaseTimeClose(e);
          }}
          color="primary"
        >
          取消
        </Button>
        <Button onClick={(e) => handleReleaseTimeClose(e)} color="primary">
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
