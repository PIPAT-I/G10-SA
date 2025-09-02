package main

import (
	"github.com/gin-gonic/gin"

	"github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/controllers"
)

const PORT = "8088"

func main() {
	// ใช้อันที่โปรเจกต์คุณมีจริง
	config.ConnectDatabase()
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())

	// เสิร์ฟไฟล์สาธารณะ (ภาพปก/อีบุ๊ก)
	r.Static("/static", "./static")

	/* -------------------------- BOOKS -------------------------- */
	r.POST("/books", controllers.CreateBook)
	r.GET("/books", controllers.FindBooks)
	r.GET("/book/:id", controllers.FindBookById)
	r.PUT("/book/update", controllers.UpdateBook) // legacy route ที่ controller รองรับ
	r.DELETE("/book/:id", controllers.DeleteBookById)

	// Book-Author association (แทน pivot controller เดิม)
	r.POST("/books/:id/authors", controllers.AddAuthorToBook)
	r.GET("/books/:id/authors", controllers.GetAuthorsOfBook)
	r.DELETE("/books/:bookId/authors/:authorId", controllers.RemoveAuthorFromBook)

	/* -------------------------- AUTHORS -------------------------- */
	// (คง controller เดิมของคุณ)
	r.POST("/new-author", controllers.CreateAuthor)
	r.GET("/authors", controllers.FindAuthors)
	r.GET("/author/:id", controllers.FindAuthorById)
	r.PUT("/author/update", controllers.UpdateAuthor)
	r.DELETE("/author/:id", controllers.DeleteAuthorById)

	/* -------------------------- FILE TYPES -------------------------- */
	r.POST("/file-types", controllers.CreateFileType)
	r.GET("/file-types", controllers.FindFileTypes)
	r.GET("/file-types/:id", controllers.FindFileTypeById)
	r.PUT("/file-types/:id", controllers.UpdateFileType)
	r.DELETE("/file-types/:id", controllers.DeleteFileTypeById)

	/* -------------------------- LANGUAGES -------------------------- */
	r.POST("/languages", controllers.CreateLanguage)
	r.GET("/languages", controllers.FindLanguages)
	r.GET("/languages/:id", controllers.FindLanguageById)
	r.PUT("/languages/:id", controllers.UpdateLanguage)
	r.DELETE("/languages/:id", controllers.DeleteLanguageById)

	/* -------------------------- PUBLISHERS -------------------------- */
	r.POST("/publishers", controllers.CreatePublisher)
	r.GET("/publishers", controllers.FindPublishers)
	r.GET("/publishers/:id", controllers.FindPublisherById)
	r.PUT("/publishers/:id", controllers.UpdatePublisher)
	r.DELETE("/publishers/:id", controllers.DeletePublisherById)

	/* -------------------------- READING ACTIVITIES -------------------------- */
	r.POST("/new-reading-activity", controllers.CreateReadingActivity)
	r.GET("/reading-activities", controllers.FindReadingActivities)
	r.GET("/reading-activity/:id", controllers.FindReadingActivityById)
	r.PUT("/reading-activity/update", controllers.UpdateReadingActivity)
	r.DELETE("/reading-activity/:id", controllers.DeleteReadingActivityById)

	/* -------------------------- UPLOADS -------------------------- */
	r.POST("/upload/cover", controllers.UploadCover)
	r.POST("/upload/ebook", controllers.UploadEbook)

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
