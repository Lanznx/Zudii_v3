import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import SelectType from "./SelectType";

export default function TypeDialog(props) {
  const { typeOpen, handleTypeClose, type, setType } = props;
  return (
    <Dialog open={typeOpen} onClose={handleTypeClose} fullWidth>
      <DialogTitle variant="primary" color="primary">
        房型種類
      </DialogTitle>
      <DialogContent>
        <DialogContentText>請選擇房型種類</DialogContentText>
        <SelectType type={type} setType={setType} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(e) => {
            setType([])
            handleTypeClose(e);
          }}
          color="primary"
        >
          取消
        </Button>
        <Button onClick={handleTypeClose} color="primary">
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
