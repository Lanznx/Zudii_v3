import random
import pprint
import time
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
collection = db.Ubike
collection.drop()


def main(city, collection, headers):
    session = requests.Session()
    response = session.get(
        f"https://ptx.transportdata.tw/MOTC/v2/Bike/Station/City/{city}?$top=10000&$format=JSON", headers=headers)
    pprint.pprint(len(response.json()))
    ubike_stations = response.json()
    if(city == "Taipei"):
        for station in ubike_stations:
            station.update({"region_name": "台北市"})
            station.update({"region": 1})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)

    elif(city == "NewTaipei"):
        for station in ubike_stations:
            station.update({"region_name": "新北市"})
            station.update({"region": 3})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)
    elif(city == "Taoyuan"):
        for station in ubike_stations:
            station.update({"region_name": "桃園市"})
            station.update({"region": 6})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)
    elif(city == "Hsinchu"):
        for station in ubike_stations:
            station.update({"region_name": "新竹市"})
            station.update({"region": 4})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)
    elif(city == "KinmenCounty"):
        for station in ubike_stations:
            station.update({"region_name": "金門縣"})
            station.update({"region": 25})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)
    elif(city == "Kaohsiung"):
        for station in ubike_stations:
            station.update({"region_name": "高雄市"})
            station.update({"region": 17})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)
    elif(city == "Taichung"):
        for station in ubike_stations:
            station.update({"region_name": "台中市"})
            station.update({"region": 8})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)
    elif(city == "Tainan"):
        for station in ubike_stations:
            station.update({"region_name": "台南市"})
            station.update({"region": 15})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)
    elif(city == "PingtungCounty"):
        for station in ubike_stations:
            station.update({"region_name": "屏東縣"})
            station.update({"region": 19})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)
    elif(city == "Chiayi"):
        for station in ubike_stations:
            station.update({"region_name": "嘉義市"})
            station.update({"region": 12})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)
    elif(city == "MiaoliCounty"):
        for station in ubike_stations:
            station.update({"region_name": "苗栗縣"})
            station.update({"region": 7})
            station.update({"position": {
                "type": "Point",
                "coordinates": [station['StationPosition']["PositionLon"], station['StationPosition']["PositionLat"]]
            }})
        collection.insert_many(ubike_stations)

    print(city)


cities = ["KinmenCounty", "Kaohsiung",
          "Taichung", "Hsinchu", "PingtungCounty", "Taoyuan", "NewTaipei", "Chiayi", "Taipei", "Tainan", "MiaoliCounty"]


for city in cities:
    main(city, collection, headers)
collection.create_index([("position", pymongo.GEOSPHERE)])
client.close()
