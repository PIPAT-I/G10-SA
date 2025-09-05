package main

import (
	"github.com/gin-gonic/gin"

	"github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/controllers/auth"
	"github.com/PIPAT-I/G10-SA/controllers/user"
	"github.com/PIPAT-I/G10-SA/middlewares"
	"github.com/PIPAT-I/G10-SA/routes"
)

const PORT = "8088"

func main() {
	// เริ่มต้นระบบ
	config.ConnectDatabase()
	config.SetupDatabase()
	r := gin.Default()
	r.Use(CORSMiddleware())

	// Static files
	r.Static("/static", "./static")

	// Auth routes (ไม่ต้องการ middleware)
	r.POST("/api/login", auth.Login)

	// CurrentUser route (ต้องการ middleware)
	r.GET("/api/currentuser", middlewares.AuthRequired(), user.GetCurrentUser)

	api := r.Group("/api")
	api.Use(middlewares.AuthRequired())
	{
		routes.SetupBookRoutes(api)
		routes.SetupBorrowRoutes(api)
		routes.SetupReservationRoutes(api)
	}

	r.Run("localhost:" + PORT)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ถ้าใช้ Credentials จริง (cookie/auth header) ควรกำหนด origin แทน "*"
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers",
			"Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
