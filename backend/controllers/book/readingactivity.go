// backend/controller/readingactivity.go
package book

import (
	"net/http"

	config "github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

// POST /new-reading-activity
func CreateReadingActivity(c *gin.Context) {
	var body entity.ReadingActivity
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
		return
	}

	if err := config.DB().Model(&entity.ReadingActivity{}).Create(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, body)
}

// GET /reading-activities
// รองรับ ?user_id=, ?book_id=, ?book_license_id=
func FindReadingActivities(c *gin.Context) {
	var items []entity.ReadingActivity
	db := config.DB()

	userID := c.Query("user_id")
	bookID := c.Query("book_id")
	bookLicenseID := c.Query("book_license_id")

	switch {
	case userID != "" && bookID != "":
		if err := db.Raw("SELECT * FROM reading_activities WHERE user_id = ? AND book_id = ?", userID, bookID).
			Find(&items).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	case userID != "":
		if err := db.Raw("SELECT * FROM reading_activities WHERE user_id = ?", userID).
			Find(&items).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	case bookID != "":
		if err := db.Raw("SELECT * FROM reading_activities WHERE book_id = ?", bookID).
			Find(&items).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	case bookLicenseID != "":
		if err := db.Raw("SELECT * FROM reading_activities WHERE book_license_id = ?", bookLicenseID).
			Find(&items).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	default:
		if err := db.Raw("SELECT * FROM reading_activities").
			Find(&items).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, items)
}

// GET /reading-activity/:id
func FindReadingActivityById(c *gin.Context) {
	var item entity.ReadingActivity
	id := c.Param("id")

	if tx := config.DB().Where("id = ?", id).First(&item); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, item)
}

// PUT /reading-activity/update
func UpdateReadingActivity(c *gin.Context) {
	var body entity.ReadingActivity
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจว่ามีเรคอร์ดนี้ไหม
	if tx := config.DB().Where("id = ?", body.ID).First(&entity.ReadingActivity{}); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	if err := config.DB().Save(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated successful"})
}

// DELETE /reading-activity/:id
func DeleteReadingActivityById(c *gin.Context) {
	id := c.Param("id")

	if tx := config.DB().Exec("DELETE FROM reading_activities WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted succesful"})
}
