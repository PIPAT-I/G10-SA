package controllers

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func ensureDir(dir string) error {
	return os.MkdirAll(dir, os.ModePerm)
}

func saveUploadedFile(c *gin.Context, subdir string, allowExts []string) (string, error) {
	file, err := c.FormFile("file")
	if err != nil {
		return "", err
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	ok := false
	for _, a := range allowExts {
		if ext == a {
			ok = true
			break
		}
	}
	if !ok {
		return "", gin.Error{
			Err:  http.ErrNotSupported,
			Type: gin.ErrorTypeBind,
			Meta: "invalid file type",
		}
	}

	dir := filepath.Join("static", subdir)
	if err := ensureDir(dir); err != nil {
		return "", err
	}

	// ตั้งชื่อไฟล์ใหม่กันชนกัน
	newName := time.Now().Format("20060102150405") + "_" + strings.ReplaceAll(file.Filename, " ", "_")
	dst := filepath.Join(dir, newName)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		return "", err
	}

	// URL ที่ฝั่งเว็บจะเรียก
	url := "/" + filepath.ToSlash(filepath.Join("static", subdir, newName))
	return url, nil
}

func UploadCover(c *gin.Context) {
	url, err := saveUploadedFile(c, "covers", []string{".png", ".jpg", ".jpeg", ".webp"})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "upload cover failed", "detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}

func UploadEbook(c *gin.Context) {
	url, err := saveUploadedFile(c, "ebooks", []string{".pdf", ".epub"})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "upload ebook failed", "detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}
