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
            main: '527C8C' ,
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
              <Grid container spaceing={2}>

                <Grid item xs={0.75}></Grid>
                <Grid item xs={4}>
                    <Chip
                      label="關於租迪"
                      sx={{
                        fontSize: 'h5.fontSize',
                        height: 'auto',
                        px: 3,
                        py: 1,
                        borderRadius: 999 ,
                    }}
                    />
                </Grid>
                <Grid item xs={7.25}></Grid>
                <Grid item xs={0.75}></Grid>
                <Grid item xs={10.5}>
                    租迪 Zudii 是一款新型態的租房輔助工具，利用爬蟲以及 Line Chatbot 來幫助使用者在第一時間找到自己理想的房屋，透過一鍵查詢、主動推播與視覺化的地圖式搜尋功能，讓租客不再需要每日瀏覽大量的租屋網站，只要拿起手機、打開租迪 Zudii 官方帳號，即可輕鬆獲取整合式的房屋資料。
                </Grid>
                <Grid item xs={0.75}></Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={0.75}></Grid>
                <Grid item xs={5}>
                    <Chip
                      label="關於租房叮嚀"
                      sx={{
                        fontSize: 'h5.fontSize',
                        height: 'auto',
                        px: 3,
                        py: 1,
                        borderRadius: 999 ,
                    }}
                    />
                </Grid>
                <Grid item xs={6.25}></Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                    看房前
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                    口找1-2位親友、或是未來的室友陪你一起看房
                    口出發前通知對方，以免被放鴿子
                    口提早10-20分鐘到看房地點附近以觀察生活機能
                    口出門前可以帶上身份證件和一點現金，若是遇上喜歡的房源，可馬上付定金
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid xs={12}></Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                    看房時
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={1}></Grid>
                <Grid xs={10}>
                    口確認每月租金、水電計價方式、有無其他外加費用
                    口年繳／月繳／長租 有無優惠
                    口確認隔間材質、附屬設備、是否通風、有無漏水
                    口確認電表所在位置、垃圾處理方式
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid xs={12}></Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                    看房後
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={1}></Grid>
                <Grid xs={10}>
                    口付訂金後記得索取收據
                    口確認簽約後是否退還定金，或是可折抵押金、租金
                    口詢問租金從哪一天開始算、是否可提前寄放物品
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
            </Grid>
          </Grid>
        </ThemeProvider>
    );
}