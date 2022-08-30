package routes

import (
	"url_shortener/src/controller"

	"github.com/gin-gonic/gin"
)

func UrlRoutes(router *gin.Engine) {
	// this is a route for url shortening
	router.POST("/url", controller.ShortenUrl)
	// this is a route for getting the original url
	router.GET("/:uid", controller.RedirectUrl)

}
