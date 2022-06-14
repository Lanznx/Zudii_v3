from distutils.command.clean import clean
from lib2to3.pgen2 import driver
from textwrap import indent
from turtle import title
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
import json


ENV_PATH = "../../.env"
CHROME_PATH = dotenv_values(ENV_PATH)["CHROME_PATH"]
options = Options()
options.add_argument("--disable-notifications")

chrome = webdriver.Chrome(service=Service(CHROME_PATH))
chrome.get(
    "https://rent.591.com.tw/?region=1&section=12&order=posttime&orderType=desc")


time.sleep(2)

soup = BeautifulSoup(chrome.page_source, 'html.parser')


posts = soup.find_all('section', {'class': 'vue-list-rent-item'})
contents = []

postNumber = 0
for post in posts:
    print("-------------postNumber-------------", postNumber)
    # print("post: ", post.prettify())
    content = {
        "title": "",
        "link": "",
        "location": "",
        "price": "",
        "type": "",
        "size": ""
    }
    # 把內文的每一行都找出來，並印出來
    title = post.find('div', {'class': "item-title"}
                      ).text.replace(" ", "").replace("\n", "")
    link = post.find("a", {'target': "_blank"})['href']
    location = post.find('div', {'class': "item-area"}
                         ).text.replace(" ", "").replace("\n", "")
    price = post.find(
        'div', {'class': "item-price-text"}).text.replace("元/月", "").replace("\n", "").replace(" ", "")
    type = (post.find("ul", {"class": "item-style"})).decode_contents().split(" ")[0].replace("<li>", "").replace("</li>", "")
    size = post.find("ul", {"class": "item-style"}).decode_contents().split(" ")[2].replace("<li>", "").replace("</li>", "")

    content.update({"title": title})
    content.update({"link": link})
    content.update({"location": location})
    content.update({"price": price})
    content.update({"type": type})
    content.update({"size": size})
    content = (json.dumps(content, ensure_ascii=False))
    contents.append(content)

    postNumber += 1

print(contents[0])

