from distutils.command.clean import clean
from lib2to3.pgen2 import driver
import jieba.posseg as pg
import jieba
import datetime
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
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import dotenv_values, load_dotenv
import pymongo

load_dotenv()
# 記得改 PATH 
ENV_PATH = "../../.env" 
FB_ACCOUNT = dotenv_values(ENV_PATH)["FB_ACCOUNT"]
FB_PWD = dotenv_values(ENV_PATH)['FB_PWD']
CHROME_PATH = dotenv_values(ENV_PATH)["CHROME_PATH"]
MONGO_CONNECTION = dotenv_values(ENV_PATH)["MONGO_CONNECTION"]
# -------- 路徑、帳密 --------
options = Options()
options.add_argument("--disable-notifications")
options.add_argument("--headless")
options.add_argument("--disable-gpu")

chrome = webdriver.Chrome(service=Service(CHROME_PATH), options=options)
chrome.get("https://www.facebook.com/")

email = chrome.find_element(By.ID, "email")
password = chrome.find_element(By.ID, "pass")

email.send_keys(FB_ACCOUNT)
password.send_keys(FB_PWD)
password.submit()
# # -------- 路徑、帳密 --------

time.sleep(2)
chrome.get(
    'https://www.facebook.com/groups/NCCU.zuker?sorting_setting=CHRONOLOGICAL')


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


posts = soup.find_all('div', {'class': 'ecm0bbzt hv4rvrfc ihqw7lf3 dati1w0a'})
postContents = []
postNumber = 0
for post in posts:
    # print("-------------postNumber-------------", postNumber)
    # 把內文的每一行都找出來，並印出來
    contents = post.find_all('div', {'dir': 'auto'}, {'style': "text-align: start"})
    content_texts = ""
    for content in contents:
        # words = pg.cut(post)
        # print(words)
        # print(content.getText())
        content_texts += content.text + "\n"
        
    postContents.append(content_texts)
    postNumber += 1







links = chrome.find_elements(
    By.XPATH, "//a[@class='oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl gmql0nx0 gpro0wi8 b1v8xokw']")
# created_times_labels = chrome.find_elements(By.XPATH, "//a[@class='oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl gmql0nx0 gpro0wi8 b1v8xokw']/span")
# print(created_times_labels, "created_times_label=================")

linkNumber = -1
# created_time_index = 0

urls = []
for link in links:
    # if(linkNumber == -1):  # 跳過第一則置頂貼文
    #     linkNumber += 1
    #     continue

    # created_time = created_times_labels[created_time_index].text #可憐、被加密過的日期
    try:
        hover_link = ActionChains(chrome)
        hover_link.move_to_element(link)
        hover_link.perform()
        url = link.get_attribute("href")  # 連結
        clean_url = url.split("?")[0]
        urls.append(clean_url)
        # print(created_time, "created_time")
        time.sleep(0.5)
    except:
        pass


    # if("分" in created_time  or "鐘" in created_time or "小" in created_time or "時" in created_time):
    #     print("今天：000")
    # elif ("昨天" in created_time):
    #     print("昨天：111")
    #     print("昨天：111", file=f)
    # elif ("月" in created_time  or "日" in created_time):
    #     print("別天啦：222")
    #     print("別天啦：222", file=f)    ### 等到日期編碼問題被解決才能 handle
    # else:
    #     print("算了zzzzzzzzzzzzz")

    # created_time_index += 1
    linkNumber += 1

# 使用 jieba 套件，準備開始斷詞


print("===========================")
print(postContents[0], end="\n")
print(urls[1], end="\n")

chrome.close()

post = {
    "postContent": postContents[0],
    "url": urls[1]
}

client = pymongo.MongoClient(MONGO_CONNECTION)
db = client.test
collection = db.try_fb


try: 
    if(collection.find_one({"url": urls[1]}) == None):
        collection.insert_one(post)
    else:
        print("post already exist")
except Exception as e:
    print(e)
    pass

