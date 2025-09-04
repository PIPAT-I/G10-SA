package routes

import (
	bookControllers "github.com/PIPAT-I/G10-SA/controllers/book"
	"github.com/gin-gonic/gin"
)

func SetupBookRoutes(api *gin.RouterGroup) {
	// Books
	api.GET("/books", bookControllers.FindBooks)
	api.GET("/books/:id", bookControllers.FindBookById)
	api.POST("/books", bookControllers.CreateBook)
	api.PUT("/books/:id", bookControllers.UpdateBook)
	api.DELETE("/books/:id", bookControllers.DeleteBookById)
	api.GET("/books/:id/authors", bookControllers.GetAuthorsOfBook)
	api.POST("/books/:id/authors", bookControllers.AddAuthorToBook)
	api.DELETE("/books/:id/authors/:authorId", bookControllers.RemoveAuthorFromBook)

	// Authors
	api.GET("/authors", bookControllers.FindAuthors)
	api.POST("/authors", bookControllers.CreateAuthor)
	api.PUT("/authors/:id", bookControllers.UpdateAuthor)
	api.DELETE("/authors/:id", bookControllers.DeleteAuthorById)

	// Publishers
	api.GET("/publishers", bookControllers.FindPublishers)
	api.POST("/publishers", bookControllers.CreatePublisher)
	api.PUT("/publishers/:id", bookControllers.UpdatePublisher)
	api.DELETE("/publishers/:id", bookControllers.DeletePublisherById)

	// Languages
	api.GET("/languages", bookControllers.FindLanguages)
	api.POST("/languages", bookControllers.CreateLanguage)
	api.PUT("/languages/:id", bookControllers.UpdateLanguage)
	api.DELETE("/languages/:id", bookControllers.DeleteLanguageById)

	// File Types
	api.GET("/file-types", bookControllers.FindFileTypes)
	api.POST("/file-types", bookControllers.CreateFileType)
	api.PUT("/file-types/:id", bookControllers.UpdateFileType)
	api.DELETE("/file-types/:id", bookControllers.DeleteFileTypeById)

	// Reading Activities
	api.POST("/reading-activities", bookControllers.CreateReadingActivity)
	api.GET("/reading-activities", bookControllers.FindReadingActivities)
	api.GET("/reading-activities/:id", bookControllers.FindReadingActivityById)
	api.PUT("/reading-activities/:id", bookControllers.UpdateReadingActivity)
	api.DELETE("/reading-activities/:id", bookControllers.DeleteReadingActivityById)

	// Uploads
	api.POST("/uploads/cover", bookControllers.UploadCover)
	api.POST("/uploads/ebook", bookControllers.UploadEbook)
}
