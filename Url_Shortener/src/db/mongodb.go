package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectMongoDB() *mongo.Client {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	MONGODB_URI := os.Getenv("MONGODB_URI")
	client, err := mongo.NewClient(options.Client().ApplyURI(MONGODB_URI))
	if err != nil {
		fmt.Println("env: ", MONGODB_URI)
		fmt.Println("Error connecting to MongoDB === 1 ===")
		log.Fatal(err)
	}

	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		fmt.Println("Error connecting to MongoDB === 2 ===")
		log.Fatal(err)
	}

	//ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		fmt.Println("Error connecting to MongoDB === 3 ===")
		log.Fatal(err)
	}
	return client
}

func CloseMongoDB(client *mongo.Client) {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err := client.Disconnect(ctx)
	if err != nil {
		log.Fatal(err)
	}
}
