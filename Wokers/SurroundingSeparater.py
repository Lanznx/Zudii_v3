from dotenv import dotenv_values, load_dotenv
import pymongo
import certifi
from datetime import datetime
import pika
import json
load_dotenv()


ENV_PATH = ".env"
MONGO_CONNECTION = dotenv_values(ENV_PATH)["MONGO_CONNECTION"]

connection = pika.BlockingConnection(
    pika.ConnectionParameters(dotenv_values(ENV_PATH)['RABBIT_MQ_HOST'], heartbeat=0))
channel = connection.channel()
channel.queue_declare("SurroundingSeparater")
client = pymongo.MongoClient(MONGO_CONNECTION, tlsCAFile=certifi.where())
db = client.test
collection_restaurant = db.restaurant
collection_shop = db.shop
collection_school = db.school


def surroundingSeparation(detailedPost):
    mapdatas = detailedPost['data']['positionRound']['mapData']
    for mapdata in mapdatas:
        for mapdataChild in mapdata['children']:
            if(mapdataChild['key'] == 'shop'):
                for mapdataLittleChild in mapdataChild['children']:
                    longitude = float(mapdataLittleChild['lng'])
                    latitude = float(mapdataLittleChild['lat'])
                    mapdataLittleChild.update(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}})
                    collection_shop.update_one(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}}, {'$set': mapdataLittleChild}, upsert=True)
            elif(mapdataChild['key'] == 'restaurant'):
                for mapdataLittleChild in mapdataChild['children']:
                    longitude = float(mapdataLittleChild['lng'])
                    latitude = float(mapdataLittleChild['lat'])
                    mapdataLittleChild.update(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}})
                    collection_restaurant.update_one(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}}, {'$set': mapdataLittleChild}, upsert=True)
            elif(mapdataChild['key'] == 'primary'):
                for mapdataLittleChild in mapdataChild['children']:
                    longitude = float(mapdataLittleChild['lng'])
                    latitude = float(mapdataLittleChild['lat'])
                    mapdataLittleChild.update({'type': 'primary'})
                    mapdataLittleChild.update(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}})
                    collection_school.update_one(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}}, {'$set': mapdataLittleChild}, upsert=True)
            elif(mapdataChild['key'] == 'secondary'):
                for mapdataLittleChild in mapdataChild['children']:
                    longitude = float(mapdataLittleChild['lng'])
                    latitude = float(mapdataLittleChild['lat'])
                    mapdataLittleChild.update({'type': 'secondary'})
                    mapdataLittleChild.update(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}})
                    collection_school.update_one(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}}, {'$set': mapdataLittleChild}, upsert=True)
            elif(mapdataChild['key'] == 'university'):
                for mapdataLittleChild in mapdataChild['children']:
                    longitude = float(mapdataLittleChild['lng'])
                    latitude = float(mapdataLittleChild['lat'])
                    mapdataLittleChild.update({'type': 'university'})
                    mapdataLittleChild.update(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}})
                    collection_school.update_one(
                        {"position": {"type": "Point", "coordinates": [longitude, latitude]}}, {'$set': mapdataLittleChild}, upsert=True)
            else:
                pass


def separate(ch, method, properties, body):
    detailedPost = json.loads(body)
    surroundingSeparation(detailedPost)
    print("05 surroundingSeparation")
    ch.basic_ack(delivery_tag=method.delivery_tag)


channel.exchange_declare(exchange='ex', exchange_type='direct',
                         passive=False, durable=False, auto_delete=False)
channel.queue_bind(exchange='ex', queue='SurroundingSeparater')
channel.basic_consume(queue='SurroundingSeparater',
                      on_message_callback=separate, auto_ack=False)
print("====== SurroundingSeparater is consuming ======")
channel.start_consuming()
