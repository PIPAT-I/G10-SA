package book

import (
	"net/http"
	"strconv"

	config "github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

// POST /languages
func CreateLanguage(c *gin.Context) {
	var body entity.Languages
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
		return
	}
	if body.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	db := config.DB()

	var dup entity.Languages
	if tx := db.Where("name = ?", body.Name).First(&dup); tx.RowsAffected > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "name already exists"})
		return
	}

	if err := db.Create(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, body)
}

// GET /languages  (รองรับ ?q=  ?page=  ?page_size=)
func FindLanguages(c *gin.Context) {
	db := config.DB()

	var items []entity.Languages
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

	tx := db.Model(&entity.Languages{})
	if q != "" {
		tx = tx.Where("name LIKE ?", "%"+q+"%") // Postgres อาจใช้ ILIKE
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

// GET /languages/:id
func FindLanguageById(c *gin.Context) {
	var lang entity.Languages
	id := c.Param("id")

	if err := config.DB().First(&lang, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, lang)
}

// PUT /languages/:id
func UpdateLanguage(c *gin.Context) {
	id := c.Param("id")

	var body entity.Languages
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	var current entity.Languages
	if err := db.First(&current, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	if body.Name != "" && body.Name != current.Name {
		var dup entity.Languages
		if tx := db.Where("name = ?", body.Name).First(&dup); tx.RowsAffected > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "name already exists"})
			return
		}
	}

	upd := map[string]any{}
	if body.Name != "" {
		upd["name"] = body.Name
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

// DELETE /languages/:id  (เช็คการใช้งานใน books ก่อนลบ)
func DeleteLanguageById(c *gin.Context) {
	idStr := c.Param("id")
	langID64, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	langID := uint(langID64)

	db := config.DB()

	// มีภาษานี้จริงไหม
	var lang entity.Languages
	if err := db.First(&lang, langID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	// กันลบถ้า languages.id ถูกใช้อยู่ใน books.language_id
	var used int64
	if err := db.Model(&entity.Book{}).
		Where("language_id = ?", langID).
		Count(&used).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if used > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "language is in use by books"})
		return
	}

	if err := db.Delete(&entity.Languages{}, langID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted successful"})
}
