package book

import (
	"net/http"
	"strings"

	config "github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

type BookWithAuthors struct {
	entity.Book
	AuthorNames string `json:"author_names"`
}

// POST /books
func CreateBook(c *gin.Context) {
	var body entity.Book
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
		return
	}
	db := config.DB()

	// --- validate FK แบบ uint (0 = ไม่ถูกส่งมา/ไม่ตั้งค่า) ---
	if body.PublisherID != 0 {
		var publisher entity.Publishers
		if tx := db.First(&publisher, body.PublisherID); tx.RowsAffected == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "publisher id not found"})
			return
		}
	}
	if body.FileTypeID != 0 {
		var ft entity.FileTypes
		if tx := db.First(&ft, body.FileTypeID); tx.RowsAffected == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "file_type id not found"})
			return
		}
	}
	if body.LanguageID != 0 {
		var lang entity.Languages
		if tx := db.First(&lang, body.LanguageID); tx.RowsAffected == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "language id not found"})
			return
		}
	}

	if err := db.Create(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, body)
}

// GET /books   (รองรับ ?publisher_id= ?file_type_id= ?language_id=)
// รวมรายชื่อผู้แต่งใน author_names (รวมด้วย Go : พกพาได้ทุก DB)
func FindBooks(c *gin.Context) {
	db := config.DB()

	var rows []entity.Book
	q := db.Model(&entity.Book{}).
		Preload("Publisher").
		Preload("FileType").
		Preload("Language").
		Preload("Authors") // <<-- ใช้ความสัมพันธ์ตรง ๆ

	if v := c.Query("publisher_id"); v != "" {
		q = q.Where("publisher_id = ?", v)
	}
	if v := c.Query("file_type_id"); v != "" {
		q = q.Where("file_type_id = ?", v)
	}
	if v := c.Query("language_id"); v != "" {
		q = q.Where("language_id = ?", v)
	}

	if err := q.Find(&rows).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// build response แปลง []Book -> []BookWithAuthors
	resp := make([]BookWithAuthors, 0, len(rows))
	for _, b := range rows {
		names := make([]string, 0, len(b.Authors))
		for _, a := range b.Authors {
			names = append(names, a.AuthorName) // <<-- ใช้ฟิลด์จริงในโมเดล
		}
		resp = append(resp, BookWithAuthors{
			Book:        b,
			AuthorNames: strings.Join(names, ", "),
		})
	}

	c.JSON(http.StatusOK, resp)
}

// PUT /book/update
// NOTE: Updates(struct) จะ "ไม่" อัปเดต zero-value; ถ้าต้องการตั้งค่าเป็น 0/"" ให้เปลี่ยนเป็น map[string]any หรือ DTO แบบ pointer
func UpdateBook(c *gin.Context) {
	var body entity.Book
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db := config.DB()

	var existing entity.Book
	if tx := db.First(&existing, body.ID); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	// กันไม่ให้เขียนค่า field ระบบทับโดยไม่ตั้งใจ
	if err := db.Model(&existing).
		Omit("ID", "CreatedAt", "UpdatedAt", "DeletedAt").
		Updates(body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated successful"})
}

// GET /book/:id  (รวม author_names)
func FindBookById(c *gin.Context) {
	id := c.Param("id")

	var b entity.Book
	if err := config.DB().
		Preload("Publisher").
		Preload("FileType").
		Preload("Language").
		Preload("Authors").
		First(&b, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	names := make([]string, 0, len(b.Authors))
	for _, a := range b.Authors {
		names = append(names, a.AuthorName)
	}

	c.JSON(http.StatusOK, BookWithAuthors{
		Book:        b,
		AuthorNames: strings.Join(names, ", "),
	})
}

// DELETE /book/:id
// ถ้าต้องการให้ลบแถวใน join table อัตโนมัติ แนะนำเพิ่ม tag constraint:OnDelete:CASCADE ที่โมเดล Book.Authors
func DeleteBookById(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var book entity.Book
	if err := db.First(&book, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	// ถ้าไม่ได้ตั้ง OnDelete:CASCADE และอยากให้ pivot สะอาด ให้เคลียร์ก่อน
	// _ = db.Model(&book).Association("Authors").Clear()

	if tx := db.Delete(&book); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted successful"})
}

/* ===================== Authors Association endpoints ===================== */

type addAuthorReq struct {
	AuthorID uint `json:"author_id" binding:"required"`
}

// POST /books/:id/authors  (เพิ่มผู้แต่งให้หนังสือ)
func AddAuthorToBook(c *gin.Context) {
	var req addAuthorReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}

	db := config.DB()

	var book entity.Book
	if err := db.First(&book, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
		return
	}

	var author entity.Author
	if err := db.First(&author, req.AuthorID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "author not found"})
		return
	}

	if err := db.Model(&book).Association("Authors").Append(&author); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "linked"})
}

// GET /books/:id/authors  (ดูรายชื่อผู้แต่งของหนังสือ)
func GetAuthorsOfBook(c *gin.Context) {
	var book entity.Book
	if err := config.DB().Preload("Authors").First(&book, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
		return
	}
	c.JSON(http.StatusOK, book.Authors)
}

// DELETE /books/:bookId/authors/:authorId  (เอาผู้แต่งออกจากหนังสือ)
func RemoveAuthorFromBook(c *gin.Context) {
	db := config.DB()

	var book entity.Book
	if err := db.First(&book, c.Param("bookId")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "book not found"})
		return
	}
	var author entity.Author
	if err := db.First(&author, c.Param("authorId")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "author not found"})
		return
	}

	if err := db.Model(&book).Association("Authors").Delete(&author); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "unlinked"})
}
