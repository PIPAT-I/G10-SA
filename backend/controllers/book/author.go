package book

import (
	"net/http"

	config "github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

// POST /new-author
func CreateAuthor(c *gin.Context) {
	var body entity.Author
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
		return
	}

	if err := config.DB().Model(&entity.Author{}).Create(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, body)
}

// GET /authors
// รองรับ ?q=<keyword> สำหรับค้นหาด้วยชื่อ
func FindAuthors(c *gin.Context) {
	var authors []entity.Author
	q := c.Query("q")

	if q != "" {
		if err := config.DB().
			Raw("SELECT * FROM authors WHERE name LIKE ?", "%"+q+"%").
			Find(&authors).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := config.DB().
			Raw("SELECT * FROM authors").
			Find(&authors).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, authors)
}

// GET /author/:id
func FindAuthorById(c *gin.Context) {
	var author entity.Author
	id := c.Param("id")

	if tx := config.DB().Where("id = ?", id).First(&author); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, author)
}

// PUT /author/update
func UpdateAuthor(c *gin.Context) {
	var author entity.Author
	if err := c.ShouldBindJSON(&author); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่ามีเรคอร์ดนี้หรือไม่
	if tx := config.DB().Where("id = ?", author.ID).First(&author); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	if err := config.DB().Save(&author).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated successful"})
}

// DELETE /author/:id
func DeleteAuthorById(c *gin.Context) {
	id := c.Param("id")

	if tx := config.DB().Exec("DELETE FROM authors WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted succesful"})
}
