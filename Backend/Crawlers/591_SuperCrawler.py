import time
import random
import requests
from bs4 import BeautifulSoup
from dotenv import dotenv_values, load_dotenv
import pymongo
from datetime import datetime, timedelta, date
import threading
import certifi
load_dotenv()


ENV_PATH = "../../.env"
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


def superCrawler(region):
    client = pymongo.MongoClient(MONGO_CONNECTION, tlsCAFile=certifi.where())
    db = client.test
    collection = db.production_591
    try:
        batch_num = collection.find().sort("batch", pymongo.DESCENDING)[0]
        batch_num = batch_num['batch'] + 1
    except:
        batch_num = 0
    postNumber = 1
    firstRow = 0
    has_next_page = True
    while(has_next_page):
        contents = []
        try:
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
            response = session.get(
                f"https://rent.591.com.tw/home/search/rsList?firstRow={firstRow}", headers=headers)
        except Exception as e:
            print("======== 爬蟲的時候發生問題囉，以下是錯誤訊息 ========")
            print(e)
            continue
        records = int(response.json()['records'].replace(",", ""))

        print(records, f" <- 這是 region {region} 的總行數")
        if(records < firstRow):
            has_next_page = False
            break
        else:
            firstRow += 30

        posts = response.json()['data']['data']
        for post in posts:
            postNumber += 1
            id_591 = int(post['post_id'])
            if(collection.find_one({"id_591": id_591}) != None):
                continue

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
                continue
            try:
                content = {
                    "id_591": int(post['post_id']),
                    "imgLink": post['photoList'][0],
                    "title": post['fulladdress'],
                    "link": "https://rent.591.com.tw/home/" + str(post['post_id']),
                    "region": region,
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
                    "region": region,
                    "location": post["location"],
                    "price": int(post['price'].replace(",", "")),
                    "type": post['kind_name'],
                    "size": float(post['area']),
                    "surrounding": post['surrounding'],
                    "release_time": release_time,
                    "converted_time": converted_time,
                    "batch": batch_num
                }
            contents.append(content)

        if(len(contents) != 0):
            collection.insert_many(contents)
    client.close()
    print("Closed connection to MongoDB")


threads = []
for i in range(1, 27):
    t = threading.Thread(target=superCrawler, args=(i,))
    threads.append(t)


for t in threads:
    t.start()
