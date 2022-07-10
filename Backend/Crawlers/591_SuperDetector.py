import time
import random
import requests
from bs4 import BeautifulSoup
from dotenv import dotenv_values, load_dotenv
import pymongo
from datetime import datetime, timedelta, date
import threading
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
USER_AGENTS = [USER_AGENT_1, USER_AGENT_2, USER_AGENT_3, USER_AGENT_4, USER_AGENT_5, USER_AGENT_6, USER_AGENT_7, USER_AGENT_8]



def superCrawler(region):
    client = pymongo.MongoClient(MONGO_CONNECTION)
    db = client.test
    collection = db.test_591
    try:
        batch_num = collection.find().sort("batch", pymongo.DESCENDING)[0]
        batch_num = batch_num['batch'] + 1
    except:
        batch_num = 0
    postNumber = 1
    firstRow = 0
    print("=============== REGION: ", region, "===============")
    has_next_page = True
    while(has_next_page):
        print("================ firstRow:", firstRow, region,  " =================")
        contents = []
        try:
            print("第一階段爬蟲：抓取大略資料")
            headers = {
                'User-Agent': random.choice(USER_AGENTS),
            }
            session = requests.Session()
            response = session.get(
                "https://rent.591.com.tw/", headers=headers)
            csrf = BeautifulSoup(response.content, 'html.parser')
            csrf = csrf.find('meta', {"name": "csrf-token"})['content']
            print("抓到 csrf", csrf)
            response = session.get(
                f"https://rent.591.com.tw/home/search/rsList?firstRow={firstRow}", headers=headers)
            headers['Cookie'] = f"591_new_session={session.cookies.get_dict()['591_new_session']};" + \
                f"urlJumpIp={region};"
            headers['X-CSRF-TOKEN'] = csrf
            print("抓到 cookie")
            time.sleep(random.randint(1, 6))
            response = session.get(
                f"https://rent.591.com.tw/home/search/rsList?firstRow={firstRow}", headers=headers) 
            print("抓到 response")
        except Exception as e:
            print("======== 爬蟲的時候發生問題囉，以下是錯誤訊息 ========")
            print(e)
            continue
        records = int(response.json()['records'].replace(",", ""))

        print(records, f" <- 這是 region {region} 的總行數")
        print("我們這次只抓取前 100 筆")
        if(records < firstRow or firstRow > 100):
            has_next_page = False
            print("沒有下一個 firstRows 了")
            break
        else:
            firstRow += 30

        print("清洗資料")

        posts = response.json()['data']['data']
        print("拿到 POSTS 了！")
        for post in posts:
            print("-------------postNumber-------------", postNumber, region)
            postNumber += 1
            id_591 = int(post['post_id'])
            if(collection.find_one({"id_591": id_591}) != None):
                print(id_591, " already exists")
                continue
            

            release_time = post['ltime'].split(" ")[0]
            converted_time = datetime.strptime(release_time, "%Y-%m-%d")
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
            print(
                f"插入 region {region} firstRow {firstRow} 的資料")
            collection.insert_many(contents)
        else: 
            print(f"region {region} firstRow {firstRow} already existed，所以我不 insert")
    client.close()
    print("Closed connection to MongoDB")
                




threads = []
for i in range(1, 27):
    t = threading.Thread(target=superCrawler, args=(i,))
    threads.append(t)


for t in threads:
    t.start()
