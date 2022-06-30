from selenium.webdriver.chrome.options import Options
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from dotenv import dotenv_values, load_dotenv
import pymongo
import json
from datetime import datetime, timedelta, date
load_dotenv()


ENV_PATH = "../.env"
MONGO_CONNECTION = dotenv_values(ENV_PATH)["MONGO_CONNECTION"]
CHROME_PATH = dotenv_values(ENV_PATH)["CHROME_PATH"]
options = Options()
options.add_argument("--disable-extensions")
options.add_argument("--disable-alerts")
options.add_argument("--disable-notifications")
options.add_argument("--disable-popups")
options.add_argument("--headless")
options.add_argument("--disable-gpu")
chrome = webdriver.Chrome(service=Service(CHROME_PATH), options=options)

# ============= 連 mongoDB =============
client = pymongo.MongoClient(MONGO_CONNECTION)
db = client.test
collection = db.dev_591

try:
    batch_num = collection.find().sort("batch", pymongo.DESCENDING)[0]
    batch_num = batch_num['batch'] + 1
except:
    batch_num = 0

contents = []
postNumber = 0


# section
# 1: 中正區
# 2: 大同區
# 3: 中山區
# 4: 松山區
# 5: 大安區
# 6: 萬華區
# 7: 信義區
# 8: 士林區
# 9: 北投區
# 10: 內湖區
# 11: 南港區
# 12: 文山區
for section in range(1, 13):
    has_next_page = True
    firstRow = 0

    try:
        while(has_next_page):
            chrome.get(
                "https://rent.591.com.tw/?region=1&section={}&order=posttime&orderType=desc&firstRow={}".format(section, str(firstRow)))
            WebDriverWait(chrome, 10000).until(
                EC.presence_of_element_located((By.CLASS_NAME, "R")))
            soup = BeautifulSoup(chrome.page_source, 'html.parser')

            posts = soup.find_all('section', {'class': 'vue-list-rent-item'})
            total_rows = soup.find("span", {"class": "R"})
            print(total_rows)
            total_rows = total_rows.text
            print(total_rows)

            for post in posts:
                print("-------------postNumber-------------", postNumber)
                content = {
                    "id_591": "",
                    "imgLink": "",
                    "title": "",
                    "link": "",
                    "section": section,
                    "position": {"type": "Point", "coordinates": []},
                    "locationLink": "",
                    "release_time": "",
                    "location": "",
                    "price": "",
                    "type": "",
                    "size": "",
                    "batch": batch_num
                }
                # 把內文的每一行都找出來，並印出來

                id_591 = post['data-bind']


                if(collection.find_one({"id_591": int(id_591)}) == None): 
                    try:
                        imgLink = post.find_all(
                            "img", {"class": "obsever-lazyimg"})[0]['data-original']
                    except:
                        imgLink = ""
                    # ============= clean Data =============
                    title = post.find('div', {'class': "item-title"}
                                    ).text.replace(" ", "").replace("\n", "")
                    link = post.find("a", {'target': "_blank"})['href']
                    location = post.find('div', {'class': "item-area"}
                                        ).text.replace(" ", "").replace("\n", "")
                    price = post.find(
                        'div', {'class': "item-price-text"}).text.replace("元/月", "").replace("\n", "").replace(" ", "").replace(",", "")
                    type = (post.find("ul", {"class": "item-style"})).decode_contents().split(
                        " ")[0].replace("<li>", "").replace("</li>", "")
                    size = post.find("ul", {"class": "item-style"}).decode_contents().split(" ")[
                        2].replace("<li>", "").replace("</li>", "").replace("坪", "")
                    if(size == "-->"):
                        size = "Nan"
                    else:
                        size = float(size)
                    # ============= get release time & position =============
                    chrome.get(link)
                    WebDriverWait(chrome, 10000).until(
                        EC.presence_of_element_located((By.CLASS_NAME, 'google-maps-link')))
                    soup = BeautifulSoup(chrome.page_source, "html.parser")
                    locationLink = soup.find(
                        "a", {'class': "google-maps-link"})['href']
                    print(locationLink, "Location Link")
                    latitude = locationLink.split("&q=")[1].split(',')[0]
                    print(latitude, " latitude")
                    longitude = locationLink.split("&q=")[1].split(",")[
                        1].split("&z=")[0]
                    print(longitude, " longtitude")

                    release_time_tag = soup.find("div", {"class", "release-time"})
                    release_time_texts = [
                        t for t in release_time_tag.find_all(text=True)]
                    for release_time_text in release_time_texts:
                        print(release_time_text,
                            "========= release time text ===========")
                        if ("剛剛" in release_time_text or "小時" in release_time_text or "分鐘" in release_time_text):
                            release_time = datetime.today().strftime('%Y-%m-%d')
                            print(release_time, "小時、分鐘")
                            break
                        elif ("天" in release_time_text):
                            release_time_text = release_time_text.replace(" ", "")
                            release_time = (datetime.today(
                            ) - timedelta(days=int(release_time_text[5:6]))).strftime('%Y-%m-%d')
                            print(release_time, "天")
                            break
                        elif ("月" in release_time_text):
                            release_time_text = release_time_text.replace(" ", "")
                            month = release_time_text.split("在")[1].split("月")[0]
                            day = release_time_text.split("月")[1].split("日")[0]
                            release_time = str(date(
                                int(datetime.today().strftime('%Y')), int(month), int(day)))
                            print(release_time, "月份")
                            break

                    # ============= clean Data =============
                    content.update({"id_591": int(id_591)})
                    content.update({"title": title})
                    content.update({"imgLink": imgLink})
                    content.update({"link": link})
                    content.update({"location": location})
                    content.update({"price": int(price)})
                    content.update({"type": type})
                    content.update({"size": size})
                    content.update({"locationLink": locationLink})
                    content.update(
                        {"position": {"type": "Point", "coordinates": [float(longitude), float(latitude)]}})
                    content.update({"release_time": release_time})

                    try:
                        collection.insert_one(content)
                        print(content["id_591"], " inserted")
                    except Exception as e: 
                        print(e)
                        raise e

                    postNumber += 1
                else: 
                    print(id_591, "already exist")
                    postNumber += 1
                    pass
            if(firstRow >= int(total_rows)):
                has_next_page = False
            else:
                firstRow += 30
    except Exception as e:
        print("error in section {}, row {}".format(section, firstRow))
        print(e)
        pass



collection.update_many({}, [
    {
        '$addFields': {
            'converted_time': {
                '$toDate': '$release_time'
            },
        }
    }
])
client.close()
print("Closed connection to MongoDB")
