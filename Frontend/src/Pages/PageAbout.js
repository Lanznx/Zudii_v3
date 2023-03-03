import * as React from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import liff from "@line/liff";

const REACT_APP_LIFF_DIRECT_ID = process.env.REACT_APP_LIFF_DIRECT_ID;
const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL;

const theme = createTheme({
    palette: {
        primary: {
            main: '#527C8C' ,
        },
    },
});

export default function PageAbout() {
    return (
        <ThemeProvider theme={theme}>
          <Grid container>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
                  租迪 Zudii
                </Typography>
              </Toolbar>
            </AppBar>
            <Grid container spacing={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}> </Grid>
                <Grid item xs={12}> </Grid>
                <Grid item xs={12}> </Grid>
                <Grid item xs={1.5}></Grid>
                <Grid item xs={5}>
                    <Chip
                      label="關於租迪"
                      style={{ backgroundColor: '#527C8C', color: 'white' }}
                      sx={{
                        fontSize: 'h6.fontSize',
                        height: 'auto',
                        px: 1,
                        py: 1,
                        borderRadius: 999 ,
                    }}
                    />
                </Grid>
                <Grid item xs={5.5}></Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={9}>
                    租迪 Zudii 是一款新型態的租房輔助工具，利用爬蟲以及 Line Chatbot 來幫助使用者在第一時間找到自己理想的房屋，透過一鍵查詢、主動推播與視覺化的地圖式搜尋功能，讓租客不再需要每日瀏覽大量的租屋網站，只要拿起手機、打開租迪 Zudii 官方帳號，即可輕鬆獲取整合式的房屋資料。
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={12}> </Grid>
                <Grid item xs={12}> </Grid>
                <Grid item xs={12}> </Grid>
                <Grid item xs={1.5}></Grid>
                <Grid item xs={5}>
                    <Chip
                      label="關於租房叮嚀"
                      style={{ backgroundColor: '#527C8C', color: 'white' }}
                      sx={{
                        fontSize: 'h6.fontSize',
                        height: 'auto',
                        px: 1,
                        py: 1,
                        borderRadius: 999 ,
                    }}
                    />
                </Grid>
                <Grid item xs={5.5}></Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={9}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    看房前
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={9}>
                    口 找1-2位親友、或是未來的室友一起看房
                    <br></br>
                    口 出發前通知對方，以免被放鴿子
                    <br></br>
                    口 提早10分鐘至看房地點附近觀察生活機能
                    <br></br>
                    口 出門前可以帶上身份證件和一點現金，若是遇上喜歡的房源，可馬上付訂金
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid xs={12}></Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={9}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    看房時
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}></Grid>
                <Grid xs={9}>
                    口 確認每月租金、水電計價方式、有無其他外加費用
                    <br></br>
                    口 年繳／月繳／長租 有無優惠
                    <br></br>
                    口 確認隔間材質、設備、是否通風或有漏水
                    <br></br>
                    口 確認電表所在位置、垃圾處理方式
                </Grid>
                <Grid xs={12}></Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={9}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    看房後
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}></Grid>
                <Grid xs={9}>
                    口 付訂金後記得索取收據
                    <br></br>
                    口 確認簽約後是否退還定金，或是可折抵押金、租金
                    <br></br>
                    口 詢問租金從哪一天開始算、是否可提前寄放物品
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
            </Grid>
          </Grid>
        </ThemeProvider>
    );
}