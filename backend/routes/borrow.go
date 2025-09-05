package routes

import (
	"github.com/PIPAT-I/G10-SA/controllers/borrow"
	"github.com/gin-gonic/gin"
)

func SetupBorrowRoutes(api *gin.RouterGroup) {
	// Initialize status cache
	borrow.CacheStatusIDs()

	// CRUD routes
	api.GET("/borrows", borrow.FindBorrows)
	api.GET("/borrows/:id", borrow.GetBorrow)
	api.POST("/borrows", borrow.CreateBorrow)
	api.PUT("/borrows/:id", borrow.UpdateBorrow)
	api.DELETE("/borrows/:id", borrow.DeleteBorrow)

	// Specialized operations
	api.PATCH("/borrows/:id/return", borrow.ReturnBorrow)

	// Job endpoints
	api.POST("/jobs/auto-return", borrow.AutoReturn)
	api.POST("/jobs/expire-notified", borrow.ExpireNotified)
}
