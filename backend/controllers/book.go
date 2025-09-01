package controllers

import (
	"net/http"

	"github.com/PIPAT-I/G10-SA/configs"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

// POST /books
// ฟังก์ชันสร้างหนังสือใหม่
func CreateBook(c *gin.Context) {
	var body entity.Book

	// อ่าน JSON request body
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
		return
	}

	db := configs.DB()

	// ตรวจสอบ FileTypeID ว่ามีในฐานข้อมูลหรือไม่
	var fileType entity.FileTypes
	if tx := db.Where("id = ?", body.FileTypeID).First(&fileType); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file type not found"})
		return
	}

	// ตรวจสอบ UserID ว่ามีในฐานข้อมูลหรือไม่
	var user entity.User
	if tx := db.Where("user_id = ?", body.UserID).First(&user); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user not found"})
		return
	}

	// บันทึกหนังสือใหม่ลงฐานข้อมูล
	if err := db.Create(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ส่ง response กลับเป็นหนังสือที่สร้าง
	c.JSON(http.StatusCreated, body)
}

// GET /books
// ฟังก์ชันดึงรายชื่อหนังสือทั้งหมด หรือของผู้ใช้เฉพาะ
func FindBooks(c *gin.Context) {
	var books []entity.Book
	userID := c.Query("user_id") // รับ user_id จาก query param

	db := configs.DB()

	if userID != "" {
		// ถ้ามี user_id ให้กรองเฉพาะหนังสือของ user นั้น
		if err := db.Preload("User").Preload("FileType").Preload("Authors").Where("user_id = ?", userID).Find(&books).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	} else {
		// ถ้าไม่มี user_id ให้ดึงหนังสือทั้งหมด
		if err := db.Preload("User").Preload("FileType").Preload("Authors").Find(&books).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, books)
}

// PUT /book/:id
// ฟังก์ชันแก้ไขหนังสือ
func UpdateBook(c *gin.Context) {
	var book entity.Book

	// อ่าน JSON request body
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := configs.DB()
	// ตรวจสอบว่าหนังสือมีอยู่จริง
	if tx := db.Where("id = ?", book.ID).First(&book); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "book not found"})
		return
	}

	// บันทึกการแก้ไข
	if err := db.Save(&book).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated successful"})
}

// GET /book/:id
// ฟังก์ชันดึงหนังสือตาม ID
func FindBookById(c *gin.Context) {
	var book entity.Book
	id := c.Param("id")
	db := configs.DB()

	// ดึงหนังสือพร้อม preload ข้อมูล User, FileType และ Authors
	if tx := db.Preload("User").Preload("FileType").Preload("Authors").Where("id = ?", id).First(&book); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, book)
}

// DELETE /book/:id
// ฟังก์ชันลบหนังสือตาม ID
func DeleteBookById(c *gin.Context) {
	id := c.Param("id")
	db := configs.DB()

	if tx := db.Exec("DELETE FROM books WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted successful"})
}
