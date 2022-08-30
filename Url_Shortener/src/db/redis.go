package db

import (
	"log"
	"os"

	"github.com/go-redis/redis"
	"github.com/joho/godotenv"
)

func ConnectRedis() *redis.Client {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	REDIS_URI := os.Getenv("REDIS_URI")
	client := redis.NewClient(&redis.Options{
		Addr: REDIS_URI,
	})

	_, err = client.Ping().Result()
	if err != nil {
		log.Fatal(err)
	}
	return client
}
