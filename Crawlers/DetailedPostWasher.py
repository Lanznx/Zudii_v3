import pprint
from dotenv import dotenv_values, load_dotenv
import pymongo
import certifi
from datetime import datetime
import pika
import json
load_dotenv()


ENV_PATH = ".env"
MONGO_CONNECTION = dotenv_values(ENV_PATH)["MONGO_CONNECTION"]

credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(
    pika.ConnectionParameters(dotenv_values(ENV_PATH)['RABBIT_MQ_HOST'], credentials=credentials, heartbeat=0))
channel = connection.channel()
channel.queue_declare("DetailedPostWasher", auto_delete=False)
# channel.basic_qos(prefetch_count=5)
client = pymongo.MongoClient(MONGO_CONNECTION, tlsCAFile=certifi.where())
db = client.test
collection_591 = db.dev_591
collection_restaurant = db.restaurant
collection_shop = db.shop
collection_school = db.school
collection_bus = db.Bus
collection_ubike = db.Ubike


def addPosition(cleanedRoughPost, detailedPost):
    try:
        longitude = float(detailedPost['data']["positionRound"]['lng'])
        latitude = float(detailedPost['data']["positionRound"]['lat'])
    except Exception as e:
        print("=============== 被抓到了 ==================")
        print(e)
        return None
    if(longitude > 180 or longitude < -180 or latitude > 90 or latitude < -90):
        return None
    cleanedRoughPost.update(
        {"position": {"type": "Point", "coordinates": [longitude, latitude]}})
    cleanedRoughPost.update(
        {"locationLink": "https://www.google.com/maps?f=q&hl=zh-TW&q={},{}&z=16".format(latitude, longitude)})
    return cleanedRoughPost


def addTraffic(cleanedDetailedPost_1):
    busStationCursor = collection_bus.aggregate([
        {
            '$geoNear': {
                'near': cleanedDetailedPost_1['position'],
                'distanceField': 'Distance',
                'maxDistance': 300,
                'spherical': False
            }
        }, {
            '$group': {
                '_id': '$StationAddress'
            }
        }, {
            '$count': 'id'
        }
    ])
    ubikeStationCursor = collection_ubike.aggregate([
        {
            '$geoNear': {
                'near': cleanedDetailedPost_1['position'],
                'distanceField': 'Distance',
                'maxDistance': 300,
                'spherical': False
            }
        }, {
            '$count': 'StationUID'
        }
    ])

    busStationList = list(busStationCursor)
    ubikeStationList = list(ubikeStationCursor)

    if(len(busStationList) == 0):
        busStationAmount = 0
    else:
        busStationAmount = busStationList[0]['id']
    if(len(ubikeStationList) == 0):
        ubikeStationAmount = 0
    else:
        ubikeStationAmount = ubikeStationList[0]['StationUID']

    cleanedDetailedPost_1.update({"bus_station_amount": busStationAmount})
    cleanedDetailedPost_1.update({"ubike_station_amount": ubikeStationAmount})
    return cleanedDetailedPost_1


def addConvertedTime(cleanedDetailedPost_2):
    converted_time = datetime.strptime(
        cleanedDetailedPost_2['release_time'], "%Y-%m-%d")
    cleanedDetailedPost_2.update(
        {"converted_time": converted_time})
    return cleanedDetailedPost_2


def wash(ch, method, properties, body):
    cleanedRoughPost = json.loads(body)['cleanedRoughPost']
    detailedPost = json.loads(body)['detailedPost']
    cleanedDetailedPost_1 = addPosition(cleanedRoughPost, detailedPost)
    print("01 addPosition")
    cleanedDetailedPost_2 = addTraffic(cleanedDetailedPost_1)
    print("02 addTraffic")
    cleanedDetailedPost_3 = addConvertedTime(cleanedDetailedPost_2)
    print("03 addConvertedTime")
    collection_591.insert_one(cleanedDetailedPost_3)
    print("04 insert")


channel.exchange_declare(exchange='ex', exchange_type='direct',
                         passive=False, durable=False, auto_delete=False)
channel.queue_bind(exchange='ex', queue='DetailedPostWasher')
channel.basic_consume(queue='DetailedPostWasher',
                      on_message_callback=wash, auto_ack=True)
print("====== DetailedPostWasher is consuming ======")
channel.start_consuming()
