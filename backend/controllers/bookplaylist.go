package controllers

import (
	"net/http"

	"github.com/PIPAT-I/G10-SA/configs"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

// POST /add-to-booklist
// ฟังก์ชันเพิ่มหนังสือเข้า Booklist
func AddToBooklist(c *gin.Context) {
	// ใช้ struct ของ relation table สำหรับ many2many
	var booklistBook entity.BooklistBooks

	// อ่าน JSON request body
	if err := c.ShouldBindJSON(&booklistBook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := configs.DB()

	// ตรวจสอบ Book ID ว่ามีในฐานข้อมูลหรือไม่
	var book entity.Book
	if tx := db.Where("id = ?", booklistBook.BookID).First(&book); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "book not found"})
		return
	}

	// ตรวจสอบ Booklist ID ว่ามีในฐานข้อมูลหรือไม่
	var booklist entity.Booklist
	if tx := db.Where("id = ?", booklistBook.BooklistID).First(&booklist); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "booklist not found"})
		return
	}

	// บันทึกลงฐานข้อมูล BooklistBooks (relation table)
	if err := db.Create(&booklistBook).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "added book to booklist successful"})
}

// DELETE /remove-from-booklist/:id
// ฟังก์ชันลบหนังสือออกจาก Booklist ตาม ID ของ relation table
func RemoveFromBooklistById(c *gin.Context) {
	id := c.Param("booklist_book_id") // ต้องตรงกับ param ที่ส่งมา

	db := configs.DB()

	// ลบ relation ออกจาก table booklist_books
	if tx := db.Exec("DELETE FROM booklist_books WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "removed book from booklist successful"})
}
