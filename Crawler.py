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
# chrome.get("https://www.facebook.com/")

# email = chrome.find_element(By.ID, "email")
# password = chrome.find_element(By.ID, "pass")

# email.send_keys(FB_ACCOUNT)
# password.send_keys(FB_PWD)
# password.submit()
# # -------- 路徑、帳密 --------

time.sleep(3)
chrome.get('https://www.facebook.com/groups/NCCU.zuker')


# 把頁面滑到最下面並按下所有的顯示更多

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


soup = BeautifulSoup(chrome.page_source, 'html.parser')
# 找出所有內文（內文裡面還會有很多行）
contents = soup.find_all('div', {'class': 'ecm0bbzt hv4rvrfc ihqw7lf3 dati1w0a'})

postNumber = 0
for content in contents:
    print("-------------postNumber-------------", postNumber)
    # 把內文的每一行都找出來，並印出來
    posts = content.find_all('div', {'dir': 'auto'}, {'style': "text-align: start"})
    for post in posts:
        # words = pg.cut(post)
        # print(words)
        print(post.getText())
    postNumber += 1


links = soup.find_all('a', {"class": "oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl gmql0nx0 gpro0wi8 b1v8xokw"})
linkNumber = 0
for link in links: 
    print("-------------link｀Number-------------", linkNumber)
    print(link.get('href'), "連結")
    print(link.get('aria-label'), "時間")
    linkNumber += 1
# 使用 jieba 套件，準備開始斷詞


chrome.close()
