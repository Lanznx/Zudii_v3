import random
import pprint
import redis
import requests
from dotenv import dotenv_values, load_dotenv
import pymongo
import certifi
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

client = pymongo.MongoClient(MONGO_CONNECTION, tlsCAFile=certifi.where())
headers = {
    'User-Agent': random.choice(USER_AGENTS),
}
db = client.test
collection = db.Bus
collection.drop()

redisClient = redis.Redis(host=dotenv_values(ENV_PATH)['REDIS_HOST'], port=dotenv_values(ENV_PATH)[
    'REDIS_PORT'], db=dotenv_values(ENV_PATH)['REDIS_DB'])


def isIdExist(id_591):
    id = redisClient.get(id_591)
    if (id != None):
        return True
    else:
        return False


def main(city, collection, headers):
    session = requests.Session()
    response = session.get(
        f"https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/{city}?%24top=100000&%24format=JSON", headers=headers)
    pprint.pprint(len(response.json()))
    bus_stations = response.json()
    if(city == "Taipei"):
        for station in bus_stations:
            station.update({"region_name": "台北市"})
            station.update({"region": 1})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)

    elif(city == "NewTaipei"):
        for station in bus_stations:
            station.update({"region_name": "新北市"})
            station.update({"region": 3})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "Taoyuan"):
        for station in bus_stations:
            station.update({"region_name": "桃園市"})
            station.update({"region": 6})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "Hsinchu"):
        for station in bus_stations:
            station.update({"region_name": "新竹市"})
            station.update({"region": 4})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "KinmenCounty"):
        for station in bus_stations:
            station.update({"region_name": "金門縣"})
            station.update({"region": 25})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "Kaohsiung"):
        for station in bus_stations:
            station.update({"region_name": "高雄市"})
            station.update({"region": 17})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "Taichung"):
        for station in bus_stations:
            station.update({"region_name": "台中市"})
            station.update({"region": 8})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "Tainan"):
        for station in bus_stations:
            station.update({"region_name": "台南市"})
            station.update({"region": 15})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "PingtungCounty"):
        for station in bus_stations:
            station.update({"region_name": "屏東縣"})
            station.update({"region": 19})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "Chiayi"):
        for station in bus_stations:
            station.update({"region_name": "嘉義市"})
            station.update({"region": 12})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "MiaoliCounty"):
        for station in bus_stations:
            station.update({"region_name": "苗栗縣"})
            station.update({"region": 7})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "PenghuCounty"):
        for station in bus_stations:
            station.update({"region_name": "澎湖縣"})
            station.update({"region": 24})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "Keelung"):
        for station in bus_stations:
            station.update({"region_name": "基隆縣"})
            station.update({"region": 2})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "TaitungCounty"):
        for station in bus_stations:
            station.update({"region_name": "台東縣"})
            station.update({"region": 22})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "YilanCounty"):
        for station in bus_stations:
            station.update({"region_name": "宜蘭縣"})
            station.update({"region": 21})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "ChiaYiCounty"):
        for station in bus_stations:
            station.update({"region_name": "嘉義縣"})
            station.update({"region": 13})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "YunlinCounty"):
        for station in bus_stations:
            station.update({"region_name": "雲林縣"})
            station.update({"region": 14})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "NantouCounty"):
        for station in bus_stations:
            station.update({"region_name": "南投縣"})
            station.update({"region": 11})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "ChanghuaCounty"):
        for station in bus_stations:
            station.update({"region_name": "彰化縣"})
            station.update({"region": 10})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "HualienCounty"):
        for station in bus_stations:
            station.update({"region_name": "花蓮縣"})
            station.update({"region": 23})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)
    elif(city == "HsinchuCounty"):
        for station in bus_stations:
            station.update({"region_name": "新竹縣"})
            station.update({"region": 5})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(bus_stations)

    print(city)


cities = ["KinmenCounty", "Kaohsiung",
          "Taichung", "Hsinchu", "PingtungCounty", "Taoyuan", "NewTaipei", "Chiayi", "Taipei", "Tainan", "MiaoliCounty",
          "HsinchuCounty", "ChanghuaCounty", "NantouCounty", "YunlinCounty", "ChiaYiCounty", "YilanCounty"
          "HualienCounty", "TaitungCounty", "PenghuCounty", "Keelung"]


for city in cities:
    main(city, collection, headers)

collection.create_index([("position", pymongo.GEOSPHERE)])
client.close()
