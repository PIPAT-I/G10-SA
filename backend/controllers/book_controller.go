package controllers

import (
	"net/http"
	"strconv"

	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/PIPAT-I/G10-SA/services"
	"github.com/gin-gonic/gin"
)

type BookController struct {
	Svc *services.BookService
}

// 📚 สร้างหนังสือใหม่
func (ctrl *BookController) CreateBook(c *gin.Context) {
	var book entity.Book

	// รับข้อมูลจาก request body
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ข้อมูลไม่ถูกต้อง: " + err.Error(),
		})
		return
	}

	// ดึง UserID จาก JWT token
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "ไม่พบข้อมูลผู้ใช้",
		})
		return
	}
	book.UserID = userID.(string)

	// สร้างหนังสือ
	if err := ctrl.Svc.CreateBook(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างหนังสือสำเร็จ",
		"book":    book,
	})
}

// 📖 ดึงหนังสือทั้งหมด
func (ctrl *BookController) GetAllBooks(c *gin.Context) {
	// รับ query parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100 // จำกัดไม่เกิน 100
	}

	// ดึงข้อมูล
	books, total, err := ctrl.Svc.GetAllBooks(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// คำนวณข้อมูล pagination
	totalPages := (int(total) + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"books": books,
		"pagination": gin.H{
			"current_page": page,
			"total_pages":  totalPages,
			"total_items":  total,
			"limit":        limit,
		},
	})
}

// 🔍 ดึงหนังสือตาม ID
func (ctrl *BookController) GetBookByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "รหัสหนังสือไม่ถูกต้อง",
		})
		return
	}

	book, err := ctrl.Svc.GetBookByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"book": book,
	})
}

// ✏️ อัปเดตหนังสือ
func (ctrl *BookController) UpdateBook(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "รหัสหนังสือไม่ถูกต้อง",
		})
		return
	}

	var updateData entity.Book
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ข้อมูลไม่ถูกต้อง: " + err.Error(),
		})
		return
	}

	// อัปเดตหนังสือ
	if err := ctrl.Svc.UpdateBook(uint(id), &updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตหนังสือสำเร็จ",
	})
}

// 🗑️ ลบหนังสือ
func (ctrl *BookController) DeleteBook(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "รหัสหนังสือไม่ถูกต้อง",
		})
		return
	}

	// ลบหนังสือ
	if err := ctrl.Svc.DeleteBook(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ลบหนังสือสำเร็จ",
	})
}

// 🔍 ค้นหาหนังสือ
func (ctrl *BookController) SearchBooks(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "กรุณาระบุคำค้นหา",
		})
		return
	}

	// รับ query parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	// ค้นหา
	books, total, err := ctrl.Svc.SearchBooks(query, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// คำนวณข้อมูล pagination
	totalPages := (int(total) + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"books": books,
		"query": query,
		"pagination": gin.H{
			"current_page": page,
			"total_pages":  totalPages,
			"total_items":  total,
			"limit":        limit,
		},
	})
}

// 📊 ดึงสถิติหนังสือ
func (ctrl *BookController) GetBookStats(c *gin.Context) {
	stats, err := ctrl.Svc.GetBookStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
	})
}
