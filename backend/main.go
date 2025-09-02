package main

import (
    "log"

    "github.com/PIPAT-I/G10-SA/configs"
    "github.com/PIPAT-I/G10-SA/controllers"
    "github.com/PIPAT-I/G10-SA/middlewares"
    "github.com/PIPAT-I/G10-SA/services"
    "github.com/gin-gonic/gin"
)

const PORT = "8080"

func main() {
    // DB setup
    configs.ConnectDatabase()
    db := configs.GetDB()

    // Services
    authService := &services.AuthService{DB: db}
    // Controllers
    authController := &controllers.AuthController{Svc: authService}	

    // Router
    r := gin.Default()
    r.Use(CORSMiddleware())

    api := r.Group("/api")

    // Auth only
    auth := api.Group("/auth")
    {
        // Public login
        auth.POST("/login", authController.Login)
        authAuthed := auth.Group("")
        authAuthed.Use(middlewares.AuthRequired())	 
    }

    log.Printf("Server starting on port %s", PORT)
    log.Fatal(r.Run("localhost:" + PORT))
}

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    }
}

