import * as React from "react";
import { Button, Grid } from "@mui/material";
import liff from "@line/liff";
const REACT_APP_LIFF_DIRECT_ID = process.env.REACT_APP_LIFF_DIRECT_ID;
const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL;

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

  React.useEffect(() => {
    initializeLIFF();
  }, []);

  return (
    <Grid container>
      <Grid item xs={12} sx={{ height: "150px" }}></Grid>

      <Grid item xs={2} md={2} />
      <Grid item xs={8} md={8}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            width: "100%",
            height: "100px",
            borderRadius: "3px",
            backgroundColor: "#4EADCB",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            marginTop: "20px",
            marginBottom: "20px",
          }}
          onClick={() => {
            if (userId === "") alert("麻煩再按一次！");
            else {
              window.location.href = `https://notify-bot.line.me/oauth/authorize?response_type=code&scope=notify&response_mode=form_post&client_id=DhQfj4nguPyCOcJpG9posj&redirect_uri=${REACT_APP_BASE_URL}notify&state=${userId}`;
            }
          }}
        >
          開啟通知
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{
            width: "100%",
            height: "100px",
            borderRadius: "3px",
            backgroundColor: "#CB4E4E",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            marginTop: "20px",
            marginBottom: "20px",
          }}
          onClick={() => {
            if (userId === "") {
              alert("麻煩再按一次！");
              return;
            }
            fetch(REACT_APP_BASE_URL + "notify/cancel", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userId,
              }),
            }).then((res) => {
              if (res.status === 200) {
                window.alert("已取消通知");
                liff.closeWindow();
              } else {
                window.alert("取消失敗，請重新嘗試");
              }
            });
          }}
        >
          關閉通知
        </Button>
      </Grid>
      <Grid item xs={2} md={2} />
    </Grid>
  );
}
