import random
import time
import requests
from bs4 import BeautifulSoup
import pprint
from dotenv import dotenv_values, load_dotenv
import pymongo
import json
from datetime import datetime, timedelta, date
import uuid
load_dotenv()

# ==================== ENV ==========================
ENV_PATH = "../.env"
MONGO_CONNECTION = dotenv_values(ENV_PATH)["MONGO_CONNECTION"]
USER_AGENT_1 = dotenv_values(ENV_PATH)['USER_AGENT_1']
USER_AGENT_2 = dotenv_values(ENV_PATH)['USER_AGENT_2']
USER_AGENT_3 = dotenv_values(ENV_PATH)['USER_AGENT_3']
USER_AGENTS = [USER_AGENT_1, USER_AGENT_2, USER_AGENT_3]
# ==================== ENV ==========================

# ==================== BATCH ==========================
client = pymongo.MongoClient(MONGO_CONNECTION)
db = client.test
collection = db.test_591
try:
    batch_num = collection.find().sort("batch", pymongo.DESCENDING)[0]
    batch_num = batch_num['batch'] + 1
except:
    batch_num = 0
# ==================== BATCH ==========================


postNumber = 1
for region in range(1, 2): 
    print("=============== REGION: ", region, "===============")
    section = 0
    has_next_section = True

    while(has_next_section):
        section += 1
        has_next_page = True
        firstRow = 0
        print("================ section:", section, " =================")

        # ==================== 測試是否有下一頁 ==========================
        print("測試是否有下一頁")
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
        }
        session = requests.Session()
        response = session.get(
            "https://rent.591.com.tw/", headers=headers)
        csrf = BeautifulSoup(response.content, 'html.parser')
        csrf = csrf.find('meta', {"name": "csrf-token"})['content']
        response = session.get(
            'https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&region={}&section={}&order=posttime&orderType=desc&firstRow={}'.format(region, section, firstRow), headers=headers)
        headers['Cookie'] = '591_new_session=' + \
            session.cookies.get_dict()['591_new_session'] + ';'
        headers['X-CSRF-TOKEN'] = csrf
        response = session.get(
            'https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&region={}&section={}&order=posttime&orderType=desc&firstRow={}'.format(region, section, firstRow), headers=headers)
        if(len(response.json()['data']['data']) == 0):
            print("沒有下一頁了")
            has_next_section = False

        while(has_next_page):
            contents = []
            try:
                # ==================== 第一階段爬蟲：抓取大略資料 ==========================
                print("第一階段爬蟲：抓取大略資料")
                headers = {
                    'User-Agent': random.choice(USER_AGENTS),
                }
                session = requests.Session()
                response = session.get(
                    "https://rent.591.com.tw/", headers=headers)
                csrf = BeautifulSoup(response.content, 'html.parser')
                csrf = csrf.find('meta', {"name": "csrf-token"})['content']
                print("抓到 csrf")
                response = session.get(
                    'https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&region={}&section={}&order=posttime&orderType=desc&firstRow={}'.format(region, section, firstRow), headers=headers)
                headers['Cookie'] = '591_new_session=' + \
                    session.cookies.get_dict()['591_new_session'] + ';'
                headers['X-CSRF-TOKEN'] = csrf
                print("抓到 cookie")
                response = session.get(
                    'https://rent.591.com.tw/home/search/rsList?is_format_data=1&is_new_list=1&type=1&region={}&section={}&order=posttime&orderType=desc&firstRow={}'.format(region, section, firstRow), headers=headers)
                print("抓到 response")
            except Exception as e:
                print("======== 爬蟲的時候發生問題囉，以下是錯誤訊息 ========")
                print(e)
                continue
            if(len(response.json()['data']['topData']) == 0):
                has_next_page = False
            else:
                firstRow += 30
        # ==================== 第一階段爬蟲：抓取大略資料 ==========================

        # ==================== 清洗資料 ==========================
            print("清洗資料")

            posts = response.json()['data']['data']
            print("拿到 POSTS 了！")
            for post in posts:
                print("-------------postNumber-------------", postNumber)
                postNumber += 1
                id_591 = int(post['post_id'])
                if(collection.find_one({"id_591": id_591}) != None):
                    print(id_591, " already exists")
                    continue
                try:
                    content = {
                        "id_591": int(post['post_id']),
                        "imgLink": post['photo_list'][0],
                        "title": post['title'],
                        "link": "https://rent.591.com.tw/home/" + str(post['post_id']),
                        "region": region,
                        "section": section,
                        "location": post["location"],
                        "price": int(post['price'].replace(",", "")),
                        "type": post['kind_name'],
                        "size": float(post['area']),
                        "position": {"type": "Point", "coordinates": []},
                        "locationLink": "",
                        "release_time": "",
                        "converted_time": "",
                        "batch": batch_num
                    }
                except:
                    content = {
                        "id_591": int(post['post_id']),
                        "imgLink": "",
                        "title": post['title'],
                        "link": "https://rent.591.com.tw/home/" + str(post['post_id']),
                        "region": region,
                        "section": section,
                        "location": post["location"],
                        "price": int(post['price'].replace(",", "")),
                        "type": post['kind_name'],
                        "size": float(post['area']),
                        "position": {"type": "Point", "coordinates": []},
                        "locationLink": "",
                        "release_time": "",
                        "converted_time": "",
                        "batch": batch_num
                    }
        # ==================== 清洗資料 ==========================

        # ==================== 第二階段爬蟲：抓取詳細資料 ==========================
                headers = {
                    'User-Agent': random.choice(USER_AGENTS),
                    'deviceid': str(uuid.uuid4()),
                    'device': "pc"
                }
                session = requests.Session()
                res = session.get(
                    "https://bff.591.com.tw/v1/house/rent/detail?id={}".format(id_591), headers=headers)

                longitude = float(res.json()['data']["positionRound"]['lng'])
                latitude = float(res.json()['data']["positionRound"]['lat'])
                if(longitude > 180 or longitude < -180 or latitude > 90 or latitude < -90):
                    print("這個人經緯度怪怪的")
                    continue
                struct_time = time.localtime(
                    res.json()['data']['favData']['posttime'])  # 轉成時間元組
                release_time = time.strftime("%Y-%m-%d", struct_time)  # 轉成字串
                converted_time = datetime.strptime(release_time, '%Y-%m-%d')
                content.update({"release_time": release_time})
                content.update({"converted_time": converted_time})
                content.update(
                    {"position": {"type": "Point", "coordinates": [longitude, latitude]}})
                content.update(
                    {"locationLink": "https://www.google.com/maps?f=q&hl=zh-TW&q={},{}&z=16".format(latitude, longitude)})
                contents.append(content)

        
        # ==================== 插入這個 section 得來的資料 ==========================
            if(len(contents) != 0):
                print(f"插入 region {region} section {section} firstRow {firstRow} 的資料")
                collection.insert_many(contents)


client.close()
print("Closed connection to MongoDB")
