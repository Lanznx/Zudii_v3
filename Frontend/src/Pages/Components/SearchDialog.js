import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Grid,
  TextField,
} from "@mui/material";

export default function SearchDialog(props) {
  const { searchOpen, handleSearchClose, setSearch } = props;
  return (
    <Dialog open={searchOpen} onClose={handleSearchClose} fullWidth>
      <DialogTitle variant="primary" color="primary">
        關鍵字
      </DialogTitle>
      <DialogContent>
        <DialogContentText>請輸入關鍵字</DialogContentText>
        <Grid
          container
          spacing={2}
          sx={{
            alignContent: "center",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Grid item xs={12}>
            <TextField
              autoFocus
              sx={{
                width: "200px",
              }}
              id="search"
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              label="關鍵字（可留白）"
              type="text"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={(e) => {
            handleSearchClose(e);
            setSearch("");
          }}
        >
          取消
        </Button>
        <Button onClick={handleSearchClose} color="primary">
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
