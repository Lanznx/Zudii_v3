package model

import (
	"context"
	"fmt"
	"log"
	"url_shortener/src/db"

	"go.mongodb.org/mongo-driver/bson"
)

func InsertlUrls(originalUrl string, uid string) bool {
	client := db.ConnectMongoDB()
	collection := client.Database("url_shortener").Collection("urls")
	result, insertErr := collection.InsertOne(context.TODO(), bson.M{"original_url": originalUrl, "uid": uid, "visit_number": 0})
	if insertErr != nil {
		fmt.Println("Error inserting into MongoDB")
		log.Fatal(insertErr)
	}
	fmt.Println("this is result ", result.InsertedID)
	defer client.Disconnect(context.TODO())
	return true
}

func GetOriginalUrl(uid string) string {
	client := db.ConnectMongoDB()
	collection := client.Database("url_shortener").Collection("urls")
	cursor, err := collection.Find(context.TODO(), bson.M{"uid": uid})
	if err != nil {
		fmt.Println("Error finding in MongoDB")
		log.Fatal(err)
	}
	var result bson.M
	for cursor.Next(context.TODO()) {
		err := cursor.Decode(&result)
		if err != nil {
			fmt.Println("Error decoding in MongoDB")
			log.Fatal(err)
		}
	}
	if result["original_url"] == nil {
		return ""
	}

	go collection.UpdateOne(context.TODO(), bson.M{"uid": uid}, bson.M{"$set": bson.M{"visit_number": result["visit_number"].(int32) + 1}})
	defer client.Disconnect(context.TODO())
	return result["original_url"].(string)
}
