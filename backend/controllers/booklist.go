package controllers

import (
	"net/http"

	"github.com/PIPAT-I/G10-SA/configs"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

// สร้าง Booklist พร้อมเพิ่มหนังสือ
func CreateBooklist(c *gin.Context) {
	var body entity.Booklist

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
		return
	}

	db := configs.DB()

	// ตรวจสอบหนังสือว่ามีอยู่จริงหรือไม่
	for _, item := range body.Books {
		var book entity.Book
		db.Where("id = ?", item.ID).First(&book)
		if book.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
			return
		}
	}

	booklist := entity.Booklist{
		Title:  body.Title,
		UserID: body.UserID,
		Books:  body.Books,
	}

	if err := db.Create(&booklist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create booklist"})
		return
	}

	c.JSON(http.StatusCreated, booklist)
}

// GET /booklists?user_id=
func FindBooklists(c *gin.Context) {
	var booklists []entity.Booklist
	userID := c.Query("user_id")
	db := configs.DB()

	query := db.Preload("Books").Preload("User")
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.Find(&booklists).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, booklists)
}

// GET /booklist/:id
func FindBooklistById(c *gin.Context) {
	var booklist entity.Booklist
	id := c.Param("id")
	db := configs.DB()

	if err := db.Preload("Books").Preload("User").Where("id = ?", id).First(&booklist).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booklist not found"})
		return
	}

	c.JSON(http.StatusOK, booklist)
}

// PUT /booklist/:id
func UpdateBooklist(c *gin.Context) {
	var body entity.Booklist
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := configs.DB()
	var existing entity.Booklist
	if err := db.Preload("Books").Where("id = ?", body.ID).First(&existing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booklist not found"})
		return
	}

	// อัปเดต fields ที่ต้องการ
	existing.Title = body.Title
	existing.Books = body.Books

	if err := db.Save(&existing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated successfully"})
}

// DELETE /booklist/:id
func DeleteBooklistById(c *gin.Context) {
	id := c.Param("id")
	db := configs.DB()

	if tx := db.Where("id = ?", id).Delete(&entity.Booklist{}); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "booklist not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted successfully"})
}
