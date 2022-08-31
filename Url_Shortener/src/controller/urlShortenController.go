package controller

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"
	"url_shortener/src/db"
	"url_shortener/src/model"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func ShortenUrl(c *gin.Context) {
	wg := new(sync.WaitGroup)
	wg.Add(1)
	defer wg.Wait()

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
	go model.InsertlUrls(originalUrl, uid, wg)

	err = db.SetValueToRedis(uid, originalUrl, 24*time.Hour)
	if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "redis error"})
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "short_url": shortUrl})
	c.Request.Body.Close()
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
	cacheUrl, err := db.GetValueFromRedis(uid)
	if err != nil {
		log.Fatal(err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "redis error"})
	}
	if cacheUrl != "" {
		c.Redirect(http.StatusMovedPermanently, cacheUrl)
		return
	}

	originalUrl := model.GetOriginalUrl(uid)
	if originalUrl == "" {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "url not found"})
		return
	}
	db.SetValueToRedis(uid, originalUrl, 24*time.Hour)
	c.Redirect(http.StatusMovedPermanently, originalUrl)
	c.Request.Body.Close()
}
