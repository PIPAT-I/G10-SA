// backend/controllers/publisher.go
package controllers

import (
	"net/http"
	"strconv"

	config "github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

// POST /publishers
func CreatePublisher(c *gin.Context) {
	var body entity.Publishers
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
		return
	}
	if body.PublisherName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "publisher_name is required"})
		return
	}

	db := config.DB()

	// กันชื่อซ้ำ (ควรมี unique index ที่ DB ด้วย)
	var dup entity.Publishers
	if err := db.Where("publisher_name = ?", body.PublisherName).First(&dup).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "publisher_name already exists"})
		return
	}

	if err := db.Create(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, body)
}

// GET /publishers  (รองรับ ?q=  ?page=  ?page_size=)
func FindPublishers(c *gin.Context) {
	db := config.DB()
	var items []entity.Publishers

	q := c.Query("q")
	pageSize := 20
	page := 1
	if v := c.Query("page_size"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 200 {
			pageSize = n
		}
	}
	if v := c.Query("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			page = n
		}
	}

	tx := db.Model(&entity.Publishers{})
	if q != "" {
		tx = tx.Where("publisher_name LIKE ?", "%"+q+"%") // Postgres อาจใช้ ILIKE
	}

	if err := tx.
		Order("id DESC").
		Limit(pageSize).
		Offset((page - 1) * pageSize).
		Find(&items).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

// GET /publishers/:id
func FindPublisherById(c *gin.Context) {
	var pub entity.Publishers
	id := c.Param("id")

	if err := config.DB().First(&pub, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, pub)
}

// PUT /publishers/:id
func UpdatePublisher(c *gin.Context) {
	id := c.Param("id")

	var body entity.Publishers
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	var current entity.Publishers
	if err := db.First(&current, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	// กันชื่อซ้ำ ถ้ามีการเปลี่ยนชื่อ
	if body.PublisherName != "" && body.PublisherName != current.PublisherName {
		var dup entity.Publishers
		if err := db.Where("publisher_name = ?", body.PublisherName).First(&dup).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "publisher_name already exists"})
			return
		}
	}

	upd := map[string]any{}
	if body.PublisherName != "" {
		upd["publisher_name"] = body.PublisherName
	}
	if len(upd) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	if err := db.Model(&current).
		Omit("ID", "CreatedAt", "DeletedAt").
		Updates(upd).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated successful"})
}

// DELETE /publishers/:id  (เช็คการใช้งานใน books ก่อนลบ)
func DeletePublisherById(c *gin.Context) {
	idStr := c.Param("id")
	pubID64, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	pubID := uint(pubID64)

	db := config.DB()

	// 1) เช็คว่ามี publisher นี้จริงไหม
	var pub entity.Publishers
	if err := db.First(&pub, pubID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	// 2) กันลบถ้า publishers.id ถูกใช้อยู่ใน books.publisher_id
	var used int64
	if err := db.Model(&entity.Book{}).
		Where("publisher_id = ?", pubID).
		Count(&used).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if used > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "publisher is in use by books"})
		return
	}

	// 3) ลบได้ปลอดภัย (เคารพ soft delete ถ้ามี gorm.Model)
	if err := db.Delete(&entity.Publishers{}, pubID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted successful"})
}
