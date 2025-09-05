package routes

import (
	"github.com/PIPAT-I/G10-SA/controllers/reservation"
	"github.com/gin-gonic/gin"
)

func SetupReservationRoutes(api *gin.RouterGroup) {
	// Initialize status cache
	reservation.CacheStatusIDs()

	// CRUD routes
	api.GET("/reservations", reservation.FindReservations)
	api.GET("/reservations/:id", reservation.GetReservation)
	api.POST("/reservations", reservation.CreateReservation)
	api.PUT("/reservations/:id", reservation.UpdateReservation)
	api.DELETE("/reservations/:id", reservation.DeleteReservation)

	// Specialized operations
	api.PATCH("/reservations/:id/fulfill", reservation.FulfillReservation)
	api.PATCH("/reservations/:id/cancel", reservation.CancelReservation)
	api.GET("/reservations/:id/queue-position", reservation.GetQueuePosition)
}
