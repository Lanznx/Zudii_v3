import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import SelectArea from "./SelectArea";

export default function LocationDialog(props) {
  const { locationOpen, handleLocationClose, location, setLocation } = props;
  return (
    <Dialog open={locationOpen} onClose={handleLocationClose} fullWidth>
      <DialogTitle variant="primary" color="primary">
        地區（限台北市）
      </DialogTitle>
      <DialogContent>
        <DialogContentText>請選擇房屋地區</DialogContentText>
        <SelectArea location={location} setLocation={setLocation} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(e) => {
            setLocation([]);
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
