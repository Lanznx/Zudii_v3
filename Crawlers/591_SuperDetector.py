import time
import random
import requests
from bs4 import BeautifulSoup
from dotenv import dotenv_values, load_dotenv
import pymongo
from datetime import datetime, timedelta, date
import calendar
import threading
import certifi
import uuid
import redis
load_dotenv()


ENV_PATH = ".env"
MONGO_CONNECTION = dotenv_values(ENV_PATH)["MONGO_CONNECTION"]
USER_AGENT_1 = dotenv_values(ENV_PATH)['USER_AGENT_1']
USER_AGENT_2 = dotenv_values(ENV_PATH)['USER_AGENT_2']
USER_AGENT_3 = dotenv_values(ENV_PATH)['USER_AGENT_3']
USER_AGENT_4 = dotenv_values(ENV_PATH)['USER_AGENT_4']
USER_AGENT_5 = dotenv_values(ENV_PATH)['USER_AGENT_5']
USER_AGENT_6 = dotenv_values(ENV_PATH)['USER_AGENT_6']
USER_AGENT_7 = dotenv_values(ENV_PATH)['USER_AGENT_7']
USER_AGENT_8 = dotenv_values(ENV_PATH)['USER_AGENT_8']
USER_AGENTS = [USER_AGENT_1, USER_AGENT_2, USER_AGENT_3, USER_AGENT_4,
               USER_AGENT_5, USER_AGENT_6, USER_AGENT_7, USER_AGENT_8]


redisClient = redis.Redis(host=dotenv_values(ENV_PATH)['REDIS_HOST'], port=dotenv_values(ENV_PATH)[
    'REDIS_PORT'], db=dotenv_values(ENV_PATH)['REDIS_DB'])


def getBatchNum(collection):
    try:
        batch_num = collection.find().sort("batch", pymongo.DESCENDING)[0]
        batch_num = batch_num['batch'] + 1
    except:
        batch_num = 0
    return batch_num


def getHouseListFrom591(firstRow, region):
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
    }
    session = requests.Session()
    response = session.get(
        "https://rent.591.com.tw/", headers=headers)
    csrf = BeautifulSoup(response.content, 'html.parser')
    csrf = csrf.find('meta', {"name": "csrf-token"})['content']
    response = session.get(
        f"https://rent.591.com.tw/home/search/rsList?firstRow={firstRow}", headers=headers)
    headers['Cookie'] = f"591_new_session={session.cookies.get_dict()['591_new_session']};" + \
        f"urlJumpIp={region};"
    headers['X-CSRF-TOKEN'] = csrf
    time.sleep(random.randint(1, 6))
    houseList = session.get(
        f"https://rent.591.com.tw/home/search/rsList?firstRow={firstRow}", headers=headers)
    return houseList


def getHouseFrom591(id_591):
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'deviceid': str(uuid.uuid4()),
        'device': "pc"
    }
    session = requests.Session()
    house = session.get(
        f"https://bff.591.com.tw/v1/house/rent/detail?id={id_591}", headers=headers)
    return house


def isIdExist(id_591, collection):
    id = redisClient.get(id_591)
    if (id != None):
        return True
    if collection.find_one({"id": id_591}) != None:
        return True
    else:
        return False


def washPostData(post, batch_num, postNumber, collection, region):
    if(isIdExist(int(post['post_id']), collection)):
        return None
    if (post['regionid'] != region):
        return None
    postNumber += 1
    id_591 = int(post['post_id'])
    redisClient.setex(id_591, 3600, id_591)
    release_time = post['ltime'].split(" ")[0]
    converted_time = datetime.strptime(release_time, "%Y-%m-%d")
    try:
        post['surrounding']['distance'] = int(
            post['surrounding']['distance'].replace("公尺", ""))
        post['surrounding']['desc'] = post['surrounding']['desc'].split("距")[
            1]
        if(post['surrounding']['type'] == "bus_station"):
            post['surrounding']['type'] = "公車"
        elif(post['surrounding']['type'] == "subway_station"):
            post['surrounding']['type'] = "捷運"
        elif(post['surrounding']['type'] == "restaurant"):
            post['surrounding']['type'] = "餐廳"
    except:
        print(id_591, "沒有 surrounding")
    try:
        content = {
            "id_591": int(post['post_id']),
            "imgLink": post['photoList'][0],
            "title": post['fulladdress'],
            "link": "https://rent.591.com.tw/home/" + str(post['post_id']),
            "region": post['regionid'],
            "region_name": post['region_name'],
            "section": post['sectionid'],
            "section_name": post['section_name'],
            "location": post["location"],
            "price": int(post['price'].replace(",", "")),
            "type": post['kind_name'],
            "size": float(post['area']),
            "surrounding": post['surrounding'],
            "release_time": release_time,
            "converted_time": converted_time,
            "batch": batch_num
        }
    except Exception as e:
        print(e)
        content = {
            "id_591": int(post['post_id']),
            "imgLink": "",
            "title": post['fulladdress'],
            "link": "https://rent.591.com.tw/home/" + str(post['post_id']),
            "region": post['regionid'],
            "region_name": post['region_name'],
            "section": post['sectionid'],
            "section_name": post['section_name'],
            "location": post["location"],
            "price": int(post['price'].replace(",", "")),
            "type": post['kind_name'],
            "size": float(post['area']),
            "surrounding": post['surrounding'],
            "release_time": release_time,
            "converted_time": converted_time,
            "batch": batch_num
        }
    try:
        house = getHouseFrom591(id_591)
        longitude = float(house.json()['data']["positionRound"]['lng'])
        latitude = float(house.json()['data']["positionRound"]['lat'])
    except Exception as e:
        print("=============== 被抓到了 ==================")
        print(e)
        return None
    if(longitude > 180 or longitude < -180 or latitude > 90 or latitude < -90):
        return None
    content.update(
        {"position": {"type": "Point", "coordinates": [longitude, latitude]}})
    content.update(
        {"locationLink": "https://www.google.com/maps?f=q&hl=zh-TW&q={},{}&z=16".format(latitude, longitude)})
    return content


def main(region):
    initail_GMT = time.gmtime()
    initial_time_stamp = calendar.timegm(initail_GMT)
    client = pymongo.MongoClient(MONGO_CONNECTION, tlsCAFile=certifi.where())
    db = client.test
    collection = db.experiment_591
    batch_num = getBatchNum(collection)

    postNumber = 1
    firstRow = 0
    has_next_page = True
    while(has_next_page):
        contents = []
        try:
            houseList = getHouseListFrom591(firstRow, region)
        except Exception as e:
            print("======== 爬蟲的時候發生問題囉，以下是錯誤訊息 ========")
            print(e)
            continue

        records = int(str(houseList.json()['records']).replace(",", ""))
        print(records, f" <- 這是 region {region} 的總行數")
        if(records < firstRow or firstRow >= 120):
            has_next_page = False
            break
        else:
            firstRow += 30

        posts = houseList.json()['data']['data']
        for post in posts:
            content = washPostData(
                post, batch_num, postNumber, collection, region)
            if(content == None):
                continue
            contents.append(content)
        if(len(contents) != 0):
            collection.insert_many(contents)
    client.close()
    print("====")
    print(f"Region {region} Closed connection to MongoDB")
    time_stamp = calendar.timegm(time.gmtime())
    print(f"time of region {region} is {time_stamp - initial_time_stamp}")
    print("====")


for j in range(1, 27, 4):
    for i in range(j, j+4):
        t = threading.Thread(target=main, args=(i,)).start()
        if (i == 27):
            break
    time.sleep(120)
    print(f"{j} 輪結束")
