package main

import (
	"github.com/PIPAT-I/G10-SA/configs"
	"github.com/PIPAT-I/G10-SA/controllers"
	"github.com/gin-gonic/gin"
)

const PORT = "8088"

func main() {
	// เชื่อมต่อ DB
	configs.ConnectDatabase()
	configs.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())

	// router := r.Group("/")
	// {

	// 	// Sound routes
	// 	router.POST("/new-book", controllers.CreateBook)
	// 	router.GET("/books", controllers.FindBooks)
	// 	router.PUT("/book/update", controllers.UpdateBook)
	// 	router.GET("/book/:id", controllers.FindBookById)
	// 	router.DELETE("/book/:id", controllers.DeleteBookById)


	// 	// Playlist routes
	// 	router.POST("/new-booklist", controllers.CreateBooklist)
	// 	router.PUT("/booklist/update", controllers.UpdateBooklist)
	// 	router.GET("/booklists", controllers.FindBooklists)
	// 	router.GET("/booklist/:id", controllers.FindBooklistById)
	// 	router.DELETE("/booklist/:id", controllers.DeleteBooklistById)

	// 	// List Sound in playlist routes
	// 	router.POST("/add-to-booklist", controllers.AddToBooklist)
	// 	router.POST("/remove-out-from-booklist/:book_booklist", controllers.AddToBooklist)

	// 	// }
	// }

	// Login routes
	r.POST("/member/auth", controllers.LoginMember)

	// Run the server go run main.go
	r.Run("localhost: " + PORT)
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
