package main

import (
	"github.com/gin-gonic/gin"

	"github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/controllers"
	"github.com/PIPAT-I/G10-SA/middlewares"
	"github.com/PIPAT-I/G10-SA/services"
)

const PORT = "8088"

func main() {
	// 🚀 เริ่มต้นระบบ
	config.ConnectDatabase()
	config.SetupDatabase()

	//  สร้าง Services
	authSvc := &services.AuthService{DB: config.DB()}
	authCtl := &controllers.AuthController{Svc: authSvc}

	r := gin.Default()
	r.Use(CORSMiddleware())

	// เสิร์ฟไฟล์สาธารณะ (ภาพปก/อีบุ๊ก)
	r.Static("/static", "./static")

	//  API Routes
	api := r.Group("/api")

	/*  PUBLIC ROUTES - ไม่ต้อง Login */
	{
		// Authentication
		auth := api.Group("/auth")
		auth.POST("/login", authCtl.Login)
	}

	/*  USER ROUTES - ต้อง Login เป็น User */
	user := api.Group("/user")
	user.Use(middlewares.AuthRequired())
	{
		//  User Book Activities
		user.POST("/reading-activities", controllers.CreateReadingActivity)
		user.GET("/reading-activities", controllers.FindReadingActivities)
		user.GET("/reading-activities/:id", controllers.FindReadingActivityById)
		user.PUT("/reading-activities/:id", controllers.UpdateReadingActivity)
		user.DELETE("/reading-activities/:id", controllers.DeleteReadingActivityById)

	}

	/*  ADMIN ROUTES - ต้อง Login เป็น Admin */
	admin := api.Group("/admin")
	admin.Use(middlewares.AuthRequired(), middlewares.RequireRoles("admin"))
	{
		//  Book Management
		admin.POST("/books", controllers.CreateBook)
		admin.PUT("/books/:id", controllers.UpdateBook)
		admin.DELETE("/books/:id", controllers.DeleteBookById)
		admin.POST("/books/:id/authors", controllers.AddAuthorToBook)
		admin.DELETE("/books/:id/authors/:authorId", controllers.RemoveAuthorFromBook)

		//  Author Management
		admin.POST("/authors", controllers.CreateAuthor)
		admin.PUT("/authors/:id", controllers.UpdateAuthor)
		admin.DELETE("/authors/:id", controllers.DeleteAuthorById)

		//  File Type Management
		admin.POST("/file-types", controllers.CreateFileType)
		admin.PUT("/file-types/:id", controllers.UpdateFileType)
		admin.DELETE("/file-types/:id", controllers.DeleteFileTypeById)

		//  Language Management
		admin.POST("/languages", controllers.CreateLanguage)
		admin.PUT("/languages/:id", controllers.UpdateLanguage)
		admin.DELETE("/languages/:id", controllers.DeleteLanguageById)

		//  Publisher Management
		admin.POST("/publishers", controllers.CreatePublisher)
		admin.PUT("/publishers/:id", controllers.UpdatePublisher)
		admin.DELETE("/publishers/:id", controllers.DeletePublisherById)

		//  File Uploads
		admin.POST("/uploads/cover", controllers.UploadCover)
		admin.POST("/uploads/ebook", controllers.UploadEbook)
	}

	r.Run(":" + PORT)
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
