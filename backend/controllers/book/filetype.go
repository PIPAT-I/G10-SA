// backend/controllers/filetype.go
package book

import (
	"net/http"
	"strconv"

	config "github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

// ตัวอย่างโมเดลที่ควรมี unique index (อ้างอิง)
// type FileTypes struct {
//     gorm.Model
//     TypeName string `gorm:"uniqueIndex;not null" json:"type_name"`
// }

// POST /file-types
func CreateFileType(c *gin.Context) {
	var body entity.FileTypes
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
		return
	}
	if body.TypeName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type_name is required"})
		return
	}

	db := config.DB()

	// กันชื่อซ้ำ (ระดับแอป) + ควรมี uniqueIndex ที่ DB
	var dup entity.FileTypes
	if err := db.Where("type_name = ?", body.TypeName).First(&dup).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "type_name already exists"})
		return
	}

	if err := db.Create(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, body)
}

// GET /file-types  (รองรับ ?q=  ?page=  ?page_size=)
func FindFileTypes(c *gin.Context) {
	db := config.DB()

	var items []entity.FileTypes
	q := c.Query("q")

	// pagination เบา ๆ
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
	tx := db.Model(&entity.FileTypes{})

	if q != "" {
		tx = tx.Where("type_name LIKE ?", "%"+q+"%")
	}

	if err := tx.
		Limit(pageSize).
		Offset((page - 1) * pageSize).
		Order("id DESC").
		Find(&items).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

// GET /file-types/:id
func FindFileTypeById(c *gin.Context) {
	var ft entity.FileTypes
	id := c.Param("id")

	if err := config.DB().First(&ft, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, ft)
}

// PUT /file-types/:id   (อัปเดตเต็ม; ถ้าจะ partial update ให้ใช้ PATCH + DTO แบบ pointer)
func UpdateFileType(c *gin.Context) {
	id := c.Param("id")

	var body entity.FileTypes
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	var current entity.FileTypes
	if err := db.First(&current, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	// กันชื่อซ้ำเมื่อเปลี่ยนชื่อ
	if body.TypeName != "" && body.TypeName != current.TypeName {
		var dup entity.FileTypes
		if err := db.Where("type_name = ?", body.TypeName).First(&dup).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "type_name already exists"})
			return
		}
	}

	// อัปเดตเฉพาะฟิลด์ที่อนุญาต
	upd := map[string]any{}
	if body.TypeName != "" {
		upd["type_name"] = body.TypeName
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

// DELETE /file-types/:id
func DeleteFileTypeById(c *gin.Context) {
	id := c.Param("id")

	// ใช้ Delete เพื่อเคารพ soft delete
	if tx := config.DB().Delete(&entity.FileTypes{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted successful"})
}
