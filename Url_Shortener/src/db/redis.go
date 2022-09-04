package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/go-redis/redis"
	"github.com/joho/godotenv"
)

func ConnectRedis() *redis.Client {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	REDIS_HOST := os.Getenv("REDIS_HOST")
	REDIS_PORT := os.Getenv("REDIS_PORT")
	client := redis.NewClient(&redis.Options{
		Addr: REDIS_HOST + ":" + REDIS_PORT,
	})

	return client
}

func GetValueFromRedis(key string) (string, error) {
	client := ConnectRedis()
	value, err := client.Get(key).Result()
	if err == redis.Nil {
		return "", nil
	}
	if err != nil {
		log.Fatal(err)
	}
	return value, err
}
func SetValueToRedis(key string, value string, time time.Duration) error {
	client := ConnectRedis()
	err := client.Set(key, value, time).Err()
	if err != nil {
		log.Fatal(err)
	}
	return err
}

func GetExpiredKey() string {
	client := ConnectRedis()
	_, err := client.Do(context.TODO(), "CONFIG", "SET", "notify-keyspace-events", "KEA").Result()
	// this is telling redis to publish events since it's off by default.
	if err != nil {
		fmt.Printf("unable to set keyspace events %v", err.Error())
		os.Exit(1)
	}
	pubsub := client.Subscribe("__keyevent@0__:expired")

	for {
		key, err := pubsub.ReceiveMessage()
		if err != nil {
			fmt.Printf("unable to receive message %v", err.Error())
			os.Exit(1)
		}
		fmt.Printf("key %v expired", key.Payload)

		return key.Payload
	}
}
