package borrow

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
type CreateBorrowRequest struct {
	UserID        string `json:"user_id" binding:"required"`
	BookID        *uint  `json:"book_id,omitempty"`
	BookLicenseID *uint  `json:"book_license_id,omitempty"`
}

type ReturnBorrowRequest struct {
	UserID string `json:"user_id" binding:"required"`
}

// Cache for status IDs
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

// GET /borrows?user_id=&active=true|false
func FindBorrows(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	var borrows []entity.Borrow
	query := db.Preload("User").
		Preload("BookLicense.Book").
		Preload("BookLicense.Book.Authors").
		Preload("BookLicense.Book.Publisher").
		Preload("BookLicense.Book.Language").
		Preload("BorrowPolicy")

	// Filter by user_id
	if userID := c.Query("user_id"); userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	// Filter by active status
	if activeStr := c.Query("active"); activeStr != "" {
		if activeStr == "true" {
			query = query.Where("return_date IS NULL")
		} else if activeStr == "false" {
			query = query.Where("return_date IS NOT NULL")
		}
	}

	if err := query.Find(&borrows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to fetch borrows",
				Details: map[string]interface{}{"error": err.Error()},
			},
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		OK:   true,
		Data: borrows,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// GET /borrows/:id
func GetBorrow(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Invalid borrow ID",
			},
		})
		return
	}

	var borrow entity.Borrow
	if err := db.Preload("User").
		Preload("BookLicense.Book").
		Preload("BookLicense.Book.Authors").
		Preload("BookLicense.Book.Publisher").
		Preload("BookLicense.Book.Language").
		Preload("BorrowPolicy").
		First(&borrow, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "NOT_FOUND",
					Message: "Borrow not found",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to fetch borrow",
			},
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		OK:   true,
		Data: borrow,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// POST /borrows
func CreateBorrow(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	var req CreateBorrowRequest
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

	// Validate that either book_id or book_license_id is provided
	if req.BookID == nil && req.BookLicenseID == nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Either book_id or book_license_id must be provided",
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

	// Check quota - count active borrows
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

	// Find available license
	var licenseID uint
	if req.BookLicenseID != nil {
		// Use specific license ID provided
		licenseID = *req.BookLicenseID
	} else {
		// Find available license for the book
		var license entity.BookLicense
		if err := tx.Where("book_id = ? AND book_status_id = ?", *req.BookID, StatusCache.Available).
			First(&license).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusConflict, APIResponse{
					OK: false,
					Error: &APIError{
						Code:    "LICENSE_TAKEN",
						Message: "No available copies of this book",
					},
				})
			} else {
				c.JSON(http.StatusInternalServerError, APIResponse{
					OK: false,
					Error: &APIError{
						Code:    "INTERNAL_ERROR",
						Message: "Failed to find available license",
					},
				})
			}
			return
		}
		licenseID = license.ID
	}

	// Try to update license status atomically
	result := tx.Model(&entity.BookLicense{}).
		Where("id = ? AND book_status_id = ?", licenseID, StatusCache.Available).
		Update("book_status_id", StatusCache.Borrowed)

	if result.Error != nil {
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

	if result.RowsAffected == 0 {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "LICENSE_TAKEN",
				Message: "License was taken by another user",
			},
		})
		return
	}

	// Create borrow record
	now := time.Now()
	dueDate := now.AddDate(0, 0, int(policy.MaxBorrowDay))

	borrow := entity.Borrow{
		UserID:         req.UserID,
		BookLicenseID:  licenseID,
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

	// Load the created borrow with relations for response
	var createdBorrow entity.Borrow
	db.Preload("User").
		Preload("BookLicense.Book").
		Preload("BookLicense.Book.Authors").
		Preload("BookLicense.Book.Publisher").
		Preload("BookLicense.Book.Language").
		Preload("BorrowPolicy").
		First(&createdBorrow, borrow.ID)

	c.JSON(http.StatusCreated, APIResponse{
		OK:   true,
		Data: createdBorrow,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// PATCH /borrows/:id/return
func ReturnBorrow(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "BAD_REQUEST",
				Message: "Invalid borrow ID",
			},
		})
		return
	}

	var req ReturnBorrowRequest
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

	// Load borrow record
	var borrow entity.Borrow
	if err := tx.Preload("BookLicense.Book").
		Preload("BookLicense.Book.Authors").
		Preload("BookLicense.Book.Publisher").
		Preload("BookLicense.Book.Language").
		First(&borrow, id).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "NOT_FOUND",
					Message: "Borrow not found",
				},
			})
		} else {
			c.JSON(http.StatusInternalServerError, APIResponse{
				OK: false,
				Error: &APIError{
					Code:    "INTERNAL_ERROR",
					Message: "Failed to load borrow",
				},
			})
		}
		return
	}

	// Verify user ownership
	if borrow.UserID != req.UserID {
		tx.Rollback()
		c.JSON(http.StatusForbidden, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "FORBIDDEN",
				Message: "You can only return your own borrows",
			},
		})
		return
	}

	// Check if already returned
	if borrow.ReturnDate != nil {
		tx.Rollback()
		c.JSON(http.StatusConflict, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "CONFLICT",
				Message: "Borrow already returned",
			},
		})
		return
	}

	// Update return date
	now := time.Now()
	if err := tx.Model(&borrow).Update("return_date", now).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to update return date",
			},
		})
		return
	}

	// Handle reservation queue
	if err := processReturnQueue(tx, borrow.BookLicense.BookID, borrow.BookLicenseID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to process reservation queue",
				Details: map[string]interface{}{"error": err.Error()},
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

	// Load updated borrow for response
	var updatedBorrow entity.Borrow
	db.Preload("User").
		Preload("BookLicense.Book").
		Preload("BookLicense.Book.Authors").
		Preload("BookLicense.Book.Publisher").
		Preload("BookLicense.Book.Language").
		Preload("BorrowPolicy").
		First(&updatedBorrow, id)

	c.JSON(http.StatusOK, APIResponse{
		OK:   true,
		Data: updatedBorrow,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// Helper function to process reservation queue after return
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

// Job endpoints
// POST /jobs/auto-return
func AutoReturn(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	now := time.Now()

	// Find overdue borrows
	var overdueBorrows []entity.Borrow
	if err := db.Where("due_date < ? AND return_date IS NULL", now).
		Find(&overdueBorrows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to find overdue borrows",
			},
		})
		return
	}

	var processedCount int
	var errors []string

	for _, borrow := range overdueBorrows {
		tx := db.Begin()

		// Set return date
		if err := tx.Model(&borrow).Update("return_date", now).Error; err != nil {
			tx.Rollback()
			errors = append(errors, "Failed to update borrow "+strconv.Itoa(int(borrow.ID)))
			continue
		}

		// Process queue
		if err := processReturnQueue(tx, borrow.BookLicense.BookID, borrow.BookLicenseID); err != nil {
			tx.Rollback()
			errors = append(errors, "Failed to process queue for borrow "+strconv.Itoa(int(borrow.ID)))
			continue
		}

		if err := tx.Commit().Error; err != nil {
			errors = append(errors, "Failed to commit borrow "+strconv.Itoa(int(borrow.ID)))
			continue
		}

		processedCount++
	}

	response := map[string]interface{}{
		"processed_count": processedCount,
		"total_overdue":   len(overdueBorrows),
	}

	if len(errors) > 0 {
		response["errors"] = errors
	}

	c.JSON(http.StatusOK, APIResponse{
		OK:   true,
		Data: response,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// POST /jobs/expire-notified
func ExpireNotified(c *gin.Context) {
	start := time.Now()
	db := config.DB()

	now := time.Now()

	// Find expired notified reservations
	var expiredReservations []entity.Reservation
	if err := db.Where("reservation_status_id = ? AND expires_at < ?", StatusCache.Notified, now).
		Find(&expiredReservations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			OK: false,
			Error: &APIError{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to find expired reservations",
			},
		})
		return
	}

	var processedCount int
	var errors []string

	for _, reservation := range expiredReservations {
		tx := db.Begin()

		// Set reservation to Expired
		if err := tx.Model(&reservation).Update("reservation_status_id", StatusCache.Expired).Error; err != nil {
			tx.Rollback()
			errors = append(errors, "Failed to expire reservation "+strconv.Itoa(int(reservation.ID)))
			continue
		}

		// Process next in queue if available
		if reservation.AllocatedBookLicenseID != nil {
			if err := processReturnQueue(tx, reservation.BookID, *reservation.AllocatedBookLicenseID); err != nil {
				tx.Rollback()
				errors = append(errors, "Failed to process queue for reservation "+strconv.Itoa(int(reservation.ID)))
				continue
			}
		}

		if err := tx.Commit().Error; err != nil {
			errors = append(errors, "Failed to commit reservation "+strconv.Itoa(int(reservation.ID)))
			continue
		}

		processedCount++
	}

	response := map[string]interface{}{
		"processed_count": processedCount,
		"total_expired":   len(expiredReservations),
	}

	if len(errors) > 0 {
		response["errors"] = errors
	}

	c.JSON(http.StatusOK, APIResponse{
		OK:   true,
		Data: response,
		Meta: &Meta{TookMs: time.Since(start).Milliseconds()},
	})
}

// Basic CRUD operations for compatibility
func UpdateBorrow(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, APIResponse{
		OK: false,
		Error: &APIError{
			Code:    "NOT_IMPLEMENTED",
			Message: "Use specific endpoints like /borrows/:id/return",
		},
	})
}

func DeleteBorrow(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, APIResponse{
		OK: false,
		Error: &APIError{
			Code:    "NOT_IMPLEMENTED",
			Message: "Borrows cannot be deleted, only returned",
		},
	})
}
