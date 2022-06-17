from textwrap import indent
from turtle import title
from distutils.command.config import config
from xml.etree.ElementPath import prepare_child
from selenium.webdriver.chrome.options import Options
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from dotenv import dotenv_values, load_dotenv
import pymongo
import json
load_dotenv()


ENV_PATH = "../../.env"
MONGO_CONNECTION = dotenv_values(ENV_PATH)["MONGO_CONNECTION"]
CHROME_PATH = dotenv_values(ENV_PATH)["CHROME_PATH"]
options = Options()
options.add_argument("--disable-notifications")


firstRow = 0
chrome = webdriver.Chrome(service=Service(CHROME_PATH))




contents = []
postNumber = 0
has_next_page = True
while(has_next_page):

    chrome.get(
        "https://rent.591.com.tw/?region=1&section=12&order=posttime&orderType=desc&firstRow=" + str(firstRow))
    time.sleep(2)

    soup = BeautifulSoup(chrome.page_source, 'html.parser')
    posts = soup.find_all('section', {'class': 'vue-list-rent-item'})

    total_rows = soup.find("span", {"class": "R"}).text
    print(total_rows)


    for post in posts:
        print("-------------postNumber-------------", postNumber)
        content = {
            "id_591": "",
            "title": "",
            "link": "",
            "location": "",
            "price": "",
            "type": "",
            "size": ""
        }
        # 把內文的每一行都找出來，並印出來

        id_591 = post['data-bind']
        title = post.find('div', {'class': "item-title"}
                          ).text.replace(" ", "").replace("\n", "")
        link = post.find("a", {'target': "_blank"})['href']
        location = post.find('div', {'class': "item-area"}
                             ).text.replace(" ", "").replace("\n", "")
        price = post.find(
            'div', {'class': "item-price-text"}).text.replace("元/月", "").replace("\n", "").replace(" ", "")
        type = (post.find("ul", {"class": "item-style"})).decode_contents().split(
            " ")[0].replace("<li>", "").replace("</li>", "")
        size = post.find("ul", {"class": "item-style"}).decode_contents().split(" ")[
            2].replace("<li>", "").replace("</li>", "")
        # ============= clean Data =============
        content.update({"id_591": id_591})
        content.update({"title": title})
        content.update({"link": link})
        content.update({"location": location})
        content.update({"price": price})
        content.update({"type": type})
        content.update({"size": size})
        contents.append(content)

        postNumber += 1
    
    if(firstRow >= int(total_rows)):
        has_next_page = False
        break
    else:
        firstRow += 30

# ============= 連 mongoDB =============
client = pymongo.MongoClient(MONGO_CONNECTION)
db = client.test
collection = db.try_591

try:
    for content in contents:
        if(collection.find_one({"id_591": content["id_591"]}) == None):

            collection.insert_one(content)
            print(content["id_591"], " inserted")
        else:
            print("already exist")
except Exception as e:
    print(e)
    raise e
finally:
    client.close()
    print("Closed connection to MongoDB")
