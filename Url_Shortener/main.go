package main

import (
	"net/http"
	routes "url_shortener/src/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	port := "9000"
	router := gin.New()

	routes.UrlRoutes(router)

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "hello, the server is running on port " + port})
	})

	router.Run(":" + port)

}
