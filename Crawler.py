import jieba.posseg as pg
import jieba
from distutils.command.config import config
from xml.etree.ElementPath import prepare_child
import dotenv
from selenium.webdriver.chrome.options import Options
import time
from bs4 import BeautifulSoup
from email.headerregistry import Group
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import dotenv_values, load_dotenv

load_dotenv()
FB_ACCOUNT = dotenv_values(".env")["FB_ACCOUNT"]
FB_PWD = dotenv_values(".env")['FB_PWD']
CHROME_PATH = dotenv_values(".env")["CHROME_PATH"]

# -------- 路徑、帳密 --------
options = Options()
options.add_argument("--disable-notifications")

chrome = webdriver.Chrome(service=Service(CHROME_PATH))
chrome.get("https://www.facebook.com/")

email = chrome.find_element(By.ID, "email")
password = chrome.find_element(By.ID, "pass")

email.send_keys(FB_ACCOUNT)
password.send_keys(FB_PWD)
password.submit()
# -------- 路徑、帳密 --------

time.sleep(3)
chrome.get('https://www.facebook.com/groups/NCCU.zuker')


# 把頁面滑到最下面 並 按下所有的顯示更多

scroll_time = 2
for i in range(scroll_time):
    chrome.execute_script("window.scrollTo(0,document.body.scrollHeight)")
    time.sleep(1.5)
    click_more = """
            var div_tags = document.getElementsByTagName("div"); 
            for(var i = 0 ; i < div_tags.length ; i ++) {
                var div_text = div_tags[i].innerText; 

                if (div_tags[i].innerText == "顯示更多") {
                    div_tags[i].click();
                }
            }            
        """
    chrome.execute_script(click_more)


# 匯入 jieba 套件，準備開始斷詞


soup = BeautifulSoup(chrome.page_source, 'html.parser')
# 找出所有內文（內文裡面還會有很多行）
contents = soup.find_all(
    'div', {'class': 'ecm0bbzt hv4rvrfc ihqw7lf3 dati1w0a'})
for content in contents:
    # 把內文的每一行都找出來，並印出來
    posts = content.find_all('div', {'dir': 'auto'}, {
                             'style': "text-align: start"})
    for post in posts:
        words = pg.cut(post)
        print(post.getText())
    print("-------------------------------------------")

chrome.close()
