package controller

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"
	"url_shortener/src/db"
	"url_shortener/src/model"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type ShortenUrlReqBody struct {
	OriginalUrl string `json:"original_url"`
}

func ShortenUrl(c *gin.Context) {
	var reqBody ShortenUrlReqBody
	if err := c.BindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request body"})
		return
	}
	fmt.Println(reqBody.OriginalUrl, "reqBody.originalUrl ===========")
	if reqBody.OriginalUrl == "" {
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
	model.InsertlUrls(reqBody.OriginalUrl, uid)

	err = db.SetValueToRedis(uid, reqBody.OriginalUrl, 24*time.Hour)
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
	fmt.Println(uid, " redirecting to cache", cacheUrl)
	if cacheUrl != "" {
		model.IncreaseVisitNumber(uid)
		c.Redirect(http.StatusMovedPermanently, cacheUrl)
		return
	}

	originalUrl := model.GetOriginalUrl(uid)
	if originalUrl == "" {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "url not found"})
		return
	}
	fmt.Println(uid, " redirecting to mongo", originalUrl)
	db.SetValueToRedis(uid, originalUrl, 3*time.Minute)
	model.IncreaseVisitNumber(uid)
	c.Redirect(http.StatusMovedPermanently, originalUrl)
}
