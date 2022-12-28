import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import SelectRegion from "./SelectRegion";
import SelectSection from "./SelectSection";
import { TextField, Typography } from "@mui/material";

export default function LocationDialog(props) {
  const {
    locationOpen,
    handleLocationClose,
    regions,
    setRegions,
    sections,
    setSections,
    provinces,
    setDistanceMRT,
  } = props;
  return (
    <Dialog open={locationOpen} onClose={handleLocationClose} fullWidth>
      <DialogTitle variant="primary" color="primary">
        地區
      </DialogTitle>
      <DialogContent>
        <DialogContentText>請選擇房屋地區、輸入捷運距離</DialogContentText>
        <SelectRegion
          setRegions={setRegions}
          regions={regions}
          provinces={provinces}
        />
        <SelectSection
          sections={sections}
          setSections={setSections}
          regions={regions}
          provinces={provinces}
        />

        <TextField
          id="distanceMRT"
          label="台北捷運（預設 1000 公尺）"
          sx={{ mt: "10px", width: "250px" }}
          type="number"
          onChange={(e) => {
            setDistanceMRT(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(e) => {
            setSections([]);
            handleLocationClose(e);
          }}
          color="primary"
        >
          取消
        </Button>
        <Button onClick={handleLocationClose} color="primary">
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
