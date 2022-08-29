from apscheduler.schedulers.blocking import BlockingScheduler
import time
import math
import pprint
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
import pika
import json
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


def getDetailedHouseFrom591(id_591):
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'deviceid': str(uuid.uuid4()),
        'device': "pc"
    }
    session = requests.Session()
    detailedHouse = session.get(
        f"https://bff.591.com.tw/v1/house/rent/detail?id={id_591}", headers=headers)
    return json.loads(detailedHouse.content)


def isIdExist(id_591):
    id = redisClient.get(id_591)
    if (id != None):
        return True
    else:
        return False


def washRoughPost(post, batch_num, postNumber, region):
    if (post['regionid'] != region):
        return None
    postNumber += 1
    id_591 = int(post['post_id'])
    redisClient.setex(id_591, 3600, id_591)
    release_time = post['ltime'].split(" ")[0]
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
        cleanedRoughPost = {
            "id_591": int(post['post_id']),
            "reachable": 1,
            "imgLink": post['photoList'][0],
            "title": post['fulladdress'],
            "link": "https://rent.591.com.tw/home/" + str(post['post_id']),
            "region": post['regionid'],
            "region_name": post['region_name'],
            "section": post['sectionid'],
            "section_name": post['section_name'],
            "location": post["location"],
            "price": int(post['price'].replace(",", "")),
            "unit_price": math.ceil(int(post['price'].replace(",", "")) / float(post['area'])),
            "type": post['kind_name'],
            "size": float(post['area']),
            "surrounding": post['surrounding'],
            "release_time": release_time,
            "batch": batch_num
        }
    except Exception as e:
        print(e)
        cleanedRoughPost = {
            "id_591": int(post['post_id']),
            "reachable": 1,
            "imgLink": "",
            "title": post['fulladdress'],
            "link": "https://rent.591.com.tw/home/" + str(post['post_id']),
            "region": post['regionid'],
            "region_name": post['region_name'],
            "section": post['sectionid'],
            "section_name": post['section_name'],
            "location": post["location"],
            "price": int(post['price'].replace(",", "")),
            "unit_price": math.ceil(int(post['price'].replace(",", "")) / float(post['area'])),
            "type": post['kind_name'],
            "size": float(post['area']),
            "surrounding": post['surrounding'],
            "release_time": release_time,
            "batch": batch_num
        }
    return cleanedRoughPost


def main(region, batch_num):
    initail_GMT = time.gmtime()
    initial_time_stamp = calendar.timegm(initail_GMT)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(dotenv_values(ENV_PATH)['RABBIT_MQ_HOST'], heartbeat=0))
    channel = connection.channel()
    channel.queue_declare("DetailedPostWasher")
    channel.queue_declare("SurroundingSeparater")
    channel.exchange_declare(exchange='ex', exchange_type='direct')
    client = pymongo.MongoClient(MONGO_CONNECTION, tlsCAFile=certifi.where())
    db = client.test
    collection = db.dev_591

    postNumber = 1
    firstRow = 0
    has_next_page = True
    while(has_next_page):
        try:
            houseList = getHouseListFrom591(firstRow, region)
        except Exception as e:
            print("======== 爬蟲的時候發生問題囉，以下是錯誤訊息 ========")
            print(e)
            continue

        records = int(str(houseList.json()['records']).replace(",", ""))
        print(records, f" <- 這是 region {region} 的總行數")
        # this is it ========================================================================================================================================================================================================================
        if(records < firstRow):
            has_next_page = False
            break
        else:
            firstRow += 30
        # this is it ========================================================================================================================================================================================================================

        posts = houseList.json()['data']['data']
        for post in posts:
            if(isIdExist(int(post['post_id']))):
                continue
            if(collection.find_one({"id_591": int(post['post_id'])}) != None):
                continue
            cleanedRoughPost = washRoughPost(
                post, batch_num, postNumber, region)
            if(cleanedRoughPost == None):
                continue
            detailedPost = getDetailedHouseFrom591(
                int(cleanedRoughPost['id_591']))
            postToBeWashed = {
                'cleanedRoughPost': cleanedRoughPost,
                'detailedPost': detailedPost
            }
            channel.basic_publish(
                exchange='ex', routing_key='DetailedPostWasher', body=json.dumps(postToBeWashed, default=str))
            channel.basic_publish(
                exchange='ex', routing_key='SurroundingSeparater', body=json.dumps(detailedPost, default=str))
    client.close()
    print("====")
    print(f"Region {region} Closed Connection to DB")
    time_stamp = calendar.timegm(time.gmtime())
    print(
        f"time of region {region} is {time_stamp - initial_time_stamp} second")
    print("====")
    connection.close()


def schedule():
    try:
        batch_client = pymongo.MongoClient(
            MONGO_CONNECTION, tlsCAFile=certifi.where())
        batch_collection = batch_client.test.dev_591
        batch_num = batch_collection.find().sort(
            "batch", pymongo.DESCENDING)[0]
        batch_num = batch_num['batch'] + 1
        batch_client.close()
    except:
        batch_num = 0
    for j in range(1, 27, 4):
        for i in range(j, j+4):
            threading.Thread(target=main, args=(i, batch_num)).start()
            if (i == 27):
                break
        time.sleep(480)
        print(f"{j} 輪結束")


schedule()  # 讓排程跑第一次
scheduler = BlockingScheduler()
scheduler.add_job(schedule, 'interval', minutes=20, args=[])

scheduler.start()
