import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";

import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Grid, TextField } from "@mui/material";

export default function RentDialog(props) {
  const { rentOpen, handleRentClose, setMinRent, setMaxRent } = props;
  return (
    <Dialog open={rentOpen} onClose={handleRentClose} fullWidth>
      <DialogTitle variant="primary" color="primary">
        租金範圍
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
          <Grid item xs={5}>
            <TextField
              autoFocus
              sx={{
                width: "100px",
              }}
              id="minRent"
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
          <Grid item xs={5} sx={{ padding: "0" }}>
            <TextField
              autoFocus
              sx={{
                width: "100px",
              }}
              id="maxRent"
              onChange={(e) => {
                console.log(e.target.value, "mMAX")
                setMaxRent(e.target.value);
              }}
              label="最高"
              type="number"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(e) => {
            setMinRent(0);
            setMaxRent(0);
            handleRentClose(e);
          }}
          color="primary"
        >
          取消
        </Button>
        <Button onClick={handleRentClose} color="primary">
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
