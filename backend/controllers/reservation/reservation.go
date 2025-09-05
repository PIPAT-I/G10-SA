package reservation

import (
	"net/http"
	"strconv"
	"time"

	"github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Response structures
type APIResponse struct {
	OK    bool        `json:"ok"`
	Data  interface{} `json:"data,omitempty"`
	Meta  *Meta       `json:"meta,omitempty"`
	Error *APIError   `json:"error,omitempty"`
}

type Meta struct {
	TookMs int64 `json:"took_ms"`
}

type APIError struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// Request structures
type CreateReservationRequest struct {
	UserID string `json:"user_id" binding:"required"`
	BookID uint   `json:"book_id" binding:"required"`
}

type FulfillReservationRequest struct {
	UserID string `json:"user_id" binding:"required"`
}

type CancelReservationRequest struct {
	UserID string `json:"user_id" binding:"required"`
	Reason string `json:"reason,omitempty"`
}

// Cache for status IDs - same as borrow package
var StatusCache struct {
	Available uint
	Borrowed  uint
	Hold      uint
	Waiting   uint
	Notified  uint
	Fulfilled uint
	Expired   uint
	Cancelled uint
}

func init() {
	// Cache will be populated after DB connection
}

func CacheStatusIDs() error {
	db := config.DB()

	// Cache BookStatus IDs
	var bookStatus entity.BookStatus
	if err := db.Where("status_name = ?", "Available").First(&bookStatus).Error; err != nil {
		return err
	}
	StatusCache.Available = bookStatus.ID

	if err := db.Where("status_name = ?", "Borrowed").First(&bookStatus).Error; err != nil {
		return err
	}
	StatusCache.Borrowed = bookStatus.ID

	if err := db.Where("status_name = ?", "Hold").First(&bookStatus).Error; err != nil {
		return err
	}
	StatusCache.Hold = bookStatus.ID

	// Cache ReservationStatus IDs
	var reservationStatus entity.ReservationStatus
	if err := db.Where("status_name = ?", "Waiting").First(&reservationStatus).Error; err != nil {
		return err
	}
	StatusCache.Waiting = reservationStatus.ID

	if err := db.Where("status_name = ?", "Notified").First(&reservationStatus).Error; err != nil {
		return err
	}
	StatusCache.Notified = reservationStatus.ID

	if err := db.Where("status_name = ?", "Fulfilled").First(&reservationStatus).Error; err != nil {
		return err
	}
	StatusCache.Fulfilled = reservationStatus.ID

	if err := db.Where("status_name = ?", "Expired").First(&reservationStatus).Error; err != nil {
		return err
	}
	StatusCache.Expired = reservationStatus.ID

	if err := db.Where("status_name = ?", "Cancelled").First(&reservationStatus).Error; err != nil {
		return err
	}
	StatusCache.Cancelled = reservationStatus.ID

	return nil
}

// GET /reservations?user_id=&book_id=&status=waiting|notified|fulfilled|expired|cancelled
func FindReservations(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	var reservations []entity.Reservation
	query := db.Preload("User").
		Preload("Book").
		Preload("Book.Authors").
		Preload("Book.Publisher").
		Preload("Book.Language").
		Preload("ReservationStatus").
		Preload("AllocatedBookLicense")

	// Filter by user_id
	if userID := c.Query("user_id"); userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	// Filter by book_id
	if bookIDStr := c.Query("book_id"); bookIDStr != "" {
		if bookID, err := strconv.ParseUint(bookIDStr, 10, 32); err == nil {
			query = query.Where("book_id = ?", bookID)
		}
	}

	// Filter by status
	if status := c.Query("status"); status != "" {
		var statusID uint
		switch status {
		case "waiting":
			statusID = StatusCache.Waiting
		case "notified":
			statusID = StatusCache.Notified
		case "fulfilled":
			statusID = StatusCache.Fulfilled
		case "expired":
			statusID = StatusCache.Expired
		case "cancelled":
			statusID = StatusCache.Cancelled
		}
		if statusID > 0 {
			query = query.Where("reservation_status_id = ?", statusID)
		}
	}

	if err := query.Order("reservation_date ASC").Find(&reservations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to fetch reservations",
				Details: map[string]interface{}{"error": err.Error()},
			},
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		OK:   true,
		Data: reservations,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// GET /reservations/:id
func GetReservation(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Invalid reservation ID",
			},
		})
		return
	}

	var reservation entity.Reservation
	if err := db.Preload("User").
		Preload("Book").
		Preload("Book.Authors").
		Preload("Book.Publisher").
		Preload("Book.Language").
		Preload("ReservationStatus").
		Preload("AllocatedBookLicense").
		First(&reservation, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "NOT_FOUND",
					Message: "Reservation not found",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to fetch reservation",
			},
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		OK:   true,
		Data: reservation,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// POST /reservations
func CreateReservation(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	var req CreateReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Invalid request body",
				Details: map[string]interface{}{"error": err.Error()},
			},
		})
		return
	}

	// Start transaction
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Load user and their role policy
	var user entity.User
	if err := tx.Preload("Role").First(&user, "user_id = ?", req.UserID).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "NOT_FOUND",
					Message: "User not found",
				},
			})
		} else {
			c.JSON(http.StatusInternalServerError, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "INTERNAL_ERROR",
					Message: "Failed to load user",
				},
			})
		}
		return
	}

	// Load borrow policy for user's role
	var policy entity.BorrowPolicy
	if err := tx.Where("role_id = ?", user.RoleID).First(&policy).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to load borrow policy",
			},
		})
		return
	}

	// Check if book exists
	var book entity.Book
	if err := tx.First(&book, req.BookID).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "NOT_FOUND",
					Message: "Book not found",
				},
			})
		} else {
			c.JSON(http.StatusInternalServerError, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "INTERNAL_ERROR",
					Message: "Failed to load book",
				},
			})
		}
		return
	}

	// Check if user already has active reservation for this book
	var existingReservation entity.Reservation
	err := tx.Where("user_id = ? AND book_id = ? AND reservation_status_id IN (?)",
		req.UserID, req.BookID, []uint{StatusCache.Waiting, StatusCache.Notified}).
		First(&existingReservation).Error

	if err == nil {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "CONFLICT",
				Message: "You already have an active reservation for this book",
				Details: map[string]interface{}{
					"existing_reservation_id": existingReservation.ID,
				},
			},
		})
		return
	} else if err != gorm.ErrRecordNotFound {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to check existing reservations",
			},
		})
		return
	}

	// Check if user already borrowed this book
	var existingBorrow entity.Borrow
	err = tx.Joins("JOIN book_licenses ON borrows.book_license_id = book_licenses.id").
		Where("borrows.user_id = ? AND book_licenses.book_id = ? AND borrows.return_date IS NULL",
			req.UserID, req.BookID).
		First(&existingBorrow).Error

	if err == nil {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "CONFLICT",
				Message: "You have already borrowed this book",
				Details: map[string]interface{}{
					"existing_borrow_id": existingBorrow.ID,
				},
			},
		})
		return
	} else if err != gorm.ErrRecordNotFound {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to check existing borrows",
			},
		})
		return
	}

	// Check reservation quota
	var activeReservationsCount int64
	if err := tx.Model(&entity.Reservation{}).
		Where("user_id = ? AND reservation_status_id IN (?)",
			req.UserID, []uint{StatusCache.Waiting, StatusCache.Notified}).
		Count(&activeReservationsCount).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to check reservation quota",
			},
		})
		return
	}

	if uint(activeReservationsCount) >= policy.MaxBorrowBook {
		tx.Rollback()
		c.JSON(http.StatusUnprocessableEntity, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "QUOTA_EXCEEDED",
				Message: "Reservation quota exceeded",
				Details: map[string]interface{}{
					"max_reservation_book": policy.MaxBorrowBook,
					"active_reservations":  activeReservationsCount,
				},
			},
		})
		return
	}

	// Check if there are available copies (not needed for reservation, but provide info)
	var availableLicensesCount int64
	tx.Model(&entity.BookLicense{}).
		Where("book_id = ? AND book_status_id = ?", req.BookID, StatusCache.Available).
		Count(&availableLicensesCount)

	// Create reservation
	now := time.Now()

	reservation := entity.Reservation{
		UserID:              req.UserID,
		BookID:              req.BookID,
		ReservationDate:     now,
		ReservationStatusID: StatusCache.Waiting,
	}

	if err := tx.Create(&reservation).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to create reservation",
			},
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to commit transaction",
			},
		})
		return
	}

	// Load the created reservation with relations for response
	var createdReservation entity.Reservation
	db.Preload("User").Preload("Book").Preload("ReservationStatus").
		First(&createdReservation, reservation.ID)

	// Calculate queue position
	var queuePosition int64
	db.Model(&entity.Reservation{}).
		Where("book_id = ? AND reservation_status_id = ? AND reservation_date < ?",
			req.BookID, StatusCache.Waiting, now).
		Count(&queuePosition)
	queuePosition++ // Current position (1-indexed)

	response := map[string]interface{}{
		"reservation":      createdReservation,
		"queue_position":   queuePosition,
		"available_copies": availableLicensesCount,
	}

	c.JSON(http.StatusCreated, APIResponse{
		OK:   true,
		Data: response,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// PATCH /reservations/:id/fulfill
func FulfillReservation(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Invalid reservation ID",
			},
		})
		return
	}

	var req FulfillReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Invalid request body",
			},
		})
		return
	}

	// Start transaction
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Load reservation
	var reservation entity.Reservation
	if err := tx.Preload("User.Role").Preload("Book").
		First(&reservation, id).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "NOT_FOUND",
					Message: "Reservation not found",
				},
			})
		} else {
			c.JSON(http.StatusInternalServerError, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "INTERNAL_ERROR",
					Message: "Failed to load reservation",
				},
			})
		}
		return
	}

	// Verify user ownership
	if reservation.UserID != req.UserID {
		tx.Rollback()
		c.JSON(http.StatusForbidden, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "FORBIDDEN",
				Message: "You can only fulfill your own reservations",
			},
		})
		return
	}

	// Check if reservation is in Notified status
	if reservation.ReservationStatusID != StatusCache.Notified {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "CONFLICT",
				Message: "Reservation is not ready for fulfillment",
			},
		})
		return
	}

	// Check if not expired
	if reservation.ExpiresAt != nil && time.Now().After(*reservation.ExpiresAt) {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "EXPIRED",
				Message: "Reservation has expired",
			},
		})
		return
	}

	// Check user's current borrow quota
	var activeBorrowsCount int64
	if err := tx.Model(&entity.Borrow{}).
		Where("user_id = ? AND return_date IS NULL", req.UserID).
		Count(&activeBorrowsCount).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to check borrow quota",
			},
		})
		return
	}

	// Load borrow policy
	var policy entity.BorrowPolicy
	if err := tx.Where("role_id = ?", reservation.User.RoleID).First(&policy).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to load borrow policy",
			},
		})
		return
	}

	if uint(activeBorrowsCount) >= policy.MaxBorrowBook {
		tx.Rollback()
		c.JSON(http.StatusUnprocessableEntity, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "QUOTA_EXCEEDED",
				Message: "Borrow quota exceeded",
				Details: map[string]interface{}{
					"max_borrow_book": policy.MaxBorrowBook,
					"active_borrows":  activeBorrowsCount,
				},
			},
		})
		return
	}

	// Verify allocated license is still on hold
	if reservation.AllocatedBookLicenseID == nil {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "CONFLICT",
				Message: "No book license allocated to this reservation",
			},
		})
		return
	}

	var license entity.BookLicense
	if err := tx.First(&license, *reservation.AllocatedBookLicenseID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to load allocated license",
			},
		})
		return
	}

	if license.BookStatusID != StatusCache.Hold {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "CONFLICT",
				Message: "Allocated license is no longer on hold",
			},
		})
		return
	}

	// Create borrow record
	now := time.Now()
	dueDate := now.AddDate(0, 0, int(policy.MaxBorrowDay))

	borrow := entity.Borrow{
		UserID:         req.UserID,
		BookLicenseID:  *reservation.AllocatedBookLicenseID,
		BorrowDate:     now,
		DueDate:        dueDate,
		BorrowPolicyID: policy.ID,
	}

	if err := tx.Create(&borrow).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to create borrow record",
			},
		})
		return
	}

	// Update license status to Borrowed
	if err := tx.Model(&license).Update("book_status_id", StatusCache.Borrowed).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to update license status",
			},
		})
		return
	}

	// Update reservation status to Fulfilled
	if err := tx.Model(&reservation).Updates(map[string]interface{}{
		"reservation_status_id": StatusCache.Fulfilled,
		"fulfilled_at":          now,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to update reservation status",
			},
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to commit transaction",
			},
		})
		return
	}

	// Load created borrow with relations for response
	var createdBorrow entity.Borrow
	db.Preload("User").Preload("BookLicense.Book").Preload("BorrowPolicy").
		First(&createdBorrow, borrow.ID)

	response := map[string]interface{}{
		"borrow": createdBorrow,
		"reservation": map[string]interface{}{
			"id":     reservation.ID,
			"status": "fulfilled",
		},
	}

	c.JSON(http.StatusOK, APIResponse{
		OK:   true,
		Data: response,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// PATCH /reservations/:id/cancel
func CancelReservation(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Invalid reservation ID",
			},
		})
		return
	}

	var req CancelReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Invalid request body",
			},
		})
		return
	}

	// Start transaction
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Load reservation
	var reservation entity.Reservation
	if err := tx.First(&reservation, id).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "NOT_FOUND",
					Message: "Reservation not found",
				},
			})
		} else {
			c.JSON(http.StatusInternalServerError, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "INTERNAL_ERROR",
					Message: "Failed to load reservation",
				},
			})
		}
		return
	}

	// Verify user ownership
	if reservation.UserID != req.UserID {
		tx.Rollback()
		c.JSON(http.StatusForbidden, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "FORBIDDEN",
				Message: "You can only cancel your own reservations",
			},
		})
		return
	}

	// Check if reservation can be cancelled (not already fulfilled or cancelled)
	if reservation.ReservationStatusID == StatusCache.Fulfilled {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "CONFLICT",
				Message: "Cannot cancel fulfilled reservation",
			},
		})
		return
	}

	if reservation.ReservationStatusID == StatusCache.Cancelled {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "CONFLICT",
				Message: "Reservation already cancelled",
			},
		})
		return
	}

	// Update reservation status to Cancelled
	now := time.Now()
	updateData := map[string]interface{}{
		"reservation_status_id": StatusCache.Cancelled,
		"cancelled_at":          now,
	}

	if req.Reason != "" {
		updateData["cancellation_reason"] = req.Reason
	}

	if err := tx.Model(&reservation).Updates(updateData).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to cancel reservation",
			},
		})
		return
	}

	// If reservation was notified with allocated license, process queue
	if reservation.ReservationStatusID == StatusCache.Notified && reservation.AllocatedBookLicenseID != nil {
		if err := processReturnQueue(tx, reservation.BookID, *reservation.AllocatedBookLicenseID); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "INTERNAL_ERROR",
					Message: "Failed to process reservation queue",
				},
			})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to commit transaction",
			},
		})
		return
	}

	// Load updated reservation for response
	var updatedReservation entity.Reservation
	db.Preload("User").Preload("Book").Preload("ReservationStatus").
		First(&updatedReservation, id)

	c.JSON(http.StatusOK, APIResponse{
		OK:   true,
		Data: updatedReservation,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// Helper function to process reservation queue after cancellation
func processReturnQueue(tx *gorm.DB, bookID uint, licenseID uint) error {
	// Find next waiting reservation for this book
	var reservation entity.Reservation
	err := tx.Where("book_id = ? AND reservation_status_id = ?", bookID, StatusCache.Waiting).
		Order("reservation_date ASC").
		First(&reservation).Error

	if err == gorm.ErrRecordNotFound {
		// No waiting reservations, set license back to Available
		return tx.Model(&entity.BookLicense{}).
			Where("id = ?", licenseID).
			Update("book_status_id", StatusCache.Available).Error
	}

	if err != nil {
		return err
	}

	// Load user's borrow policy for hold duration
	var user entity.User
	if err := tx.Preload("Role").First(&user, "user_id = ?", reservation.UserID).Error; err != nil {
		return err
	}

	var policy entity.BorrowPolicy
	if err := tx.Where("role_id = ?", user.RoleID).First(&policy).Error; err != nil {
		return err
	}

	// Set license to Hold
	if err := tx.Model(&entity.BookLicense{}).
		Where("id = ?", licenseID).
		Update("book_status_id", StatusCache.Hold).Error; err != nil {
		return err
	}

	// Update reservation to Notified
	now := time.Now()
	expiresAt := now.Add(time.Duration(policy.HoldHour) * time.Hour)

	return tx.Model(&reservation).Updates(map[string]interface{}{
		"reservation_status_id":     StatusCache.Notified,
		"allocated_book_license_id": licenseID,
		"notified_at":               now,
		"expires_at":                expiresAt,
	}).Error
}

// GET /reservations/:id/queue-position
func GetQueuePosition(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Invalid reservation ID",
			},
		})
		return
	}

	// Load reservation
	var reservation entity.Reservation
	if err := db.First(&reservation, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "NOT_FOUND",
					Message: "Reservation not found",
				},
			})
		} else {
			c.JSON(http.StatusInternalServerError, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "INTERNAL_ERROR",
					Message: "Failed to load reservation",
				},
			})
		}
		return
	}

	// Only calculate queue position for waiting reservations
	if reservation.ReservationStatusID != StatusCache.Waiting {
		c.JSON(http.StatusOK, APIResponse{
			OK: true,
			Data: map[string]interface{}{
				"reservation_id": reservation.ID,
				"status":         "not_waiting",
				"queue_position": nil,
			},
			Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
		})
		return
	}

	// Count waiting reservations before this one
	var position int64
	if err := db.Model(&entity.Reservation{}).
		Where("book_id = ? AND reservation_status_id = ? AND reservation_date < ?",
			reservation.BookID, StatusCache.Waiting, reservation.ReservationDate).
		Count(&position).Error; err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to calculate queue position",
			},
		})
		return
	}

	position++ // 1-indexed position

	// Count total waiting for this book
	var totalWaiting int64
	db.Model(&entity.Reservation{}).
		Where("book_id = ? AND reservation_status_id = ?", reservation.BookID, StatusCache.Waiting).
		Count(&totalWaiting)

	c.JSON(http.StatusOK, APIResponse{
		OK: true,
		Data: map[string]interface{}{
			"reservation_id": reservation.ID,
			"status":         "waiting",
			"queue_position": position,
			"total_waiting":  totalWaiting,
		},
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// Basic CRUD operations for compatibility
func UpdateReservation(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, APIResponse{
		OK: false,
		Error: &APIError{
			Code:    "NOT_IMPLEMENTED",
			Message: "Use specific endpoints like /reservations/:id/fulfill or /reservations/:id/cancel",
		},
	})
}

func DeleteReservation(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, APIResponse{
		OK: false,
		Error: &APIError{
			Code:    "NOT_IMPLEMENTED",
			Message: "Use /reservations/:id/cancel to cancel reservations",
		},
	})
}
