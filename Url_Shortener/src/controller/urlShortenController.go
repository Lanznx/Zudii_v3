package controller

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"
	"url_shortener/src/db"
	"url_shortener/src/model"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"github.com/joho/godotenv"
)

func ShortenUrl(c *gin.Context) {
	originalUrl := c.PostForm("original_url")
	if originalUrl == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "original_url is required"})
		return
	}
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	BASE_URL := os.Getenv("BASE_URL")
	uid := genUniqueId()
	shortUrl := BASE_URL + uid
	go model.InsertlUrls(originalUrl, uid)

	redisClient := db.ConnectRedis()
	err = redisClient.Set(uid, originalUrl, 24*time.Hour).Err()
	if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "redis error"})
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "short_url": shortUrl})
}

func genUniqueId() string {
	const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 10
	var result string
	rand.Seed(time.Now().UnixNano())
	for i := 0; i < length; i++ {
		result += string(str[rand.Intn(len(str))])
	}
	return result
}

func RedirectUrl(c *gin.Context) {
	uid := c.Param("uid")
	if uid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "short_url is required"})
		return
	}
	redisClient := db.ConnectRedis()
	cacheUrl, err := redisClient.Get(uid).Result()
	if err == redis.Nil {
		originalUrl := model.GetOriginalUrl(uid)
		if originalUrl == "" {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "url not found"})
			return
		}
		redisClient.Set(uid, originalUrl, 24*time.Hour).Err()
		c.Redirect(http.StatusMovedPermanently, originalUrl)
	} else if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "redis error"})
	} else {
		c.Redirect(http.StatusMovedPermanently, cacheUrl)
	}

}
