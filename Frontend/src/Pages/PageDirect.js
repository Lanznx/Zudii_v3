import * as React from "react";
import { Grid, Typography } from "@mui/material";
import { Button, CardActionArea } from "@mui/material";
import liff from "@line/liff";
const REACT_APP_LIFF_DIRECT_ID = process.env.REACT_APP_LIFF_DIRECT_ID;

export default function PageDirect() {
  const [userId, setUserId] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");

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
      setDisplayName(profile.displayName);
    }
  }
  // initializeLIFF();

  return (
    <Grid container>
      <Grid item xs={2} md={2} />
      <Grid item xs={8} md={8}>
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
            window.location.href = `https://notify-bot.line.me/oauth/authorize?response_type=code&scope=notify&response_mode=form_post&client_id=DhQfj4nguPyCOcJpG9posj&redirect_uri=https://zudii.tk/api/notify&state=${userId}`;
          }}
        >
          開啟通知
        </Button>
        <Button
          variant="contained"
          color="primary"
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
            fetch("")
            liff.closeWindow()
          }}
        >
          關閉通知
        </Button>
      </Grid>
      <Grid item xs={2} md={2} />
    </Grid>
  );
}
