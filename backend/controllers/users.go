package controllers

import (
	"net/http"

	"github.com/PIPAT-I/G10-SA/configs"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/gin-gonic/gin"
)

// GET /members
func FindMembers(c *gin.Context) {
	var members []entity.User // สร้าง slice สำหรับเก็บสมาชิกหลายตัว

	// ดึงสมาชิกทั้งหมดจาก database
	if err := configs.DB().Find(&members).Error; err != nil {
		// ถ้ามี error ส่ง HTTP 500 พร้อมข้อความ error
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งสมาชิกทั้งหมดกลับ client ในรูปแบบ JSON
	c.JSON(http.StatusOK, members)
}

// GET /member/:id
func FindMemberById(c *gin.Context) {
	var member entity.User // สร้างตัวแปรสำหรับเก็บสมาชิก 1 คน

	id := c.Param("id") // อ่าน user_id จาก URL path

	// ดึงสมาชิกตาม user_id
	if err := configs.DB().Where("user_id = ?", id).First(&member).Error; err != nil {
		// ถ้าไม่พบ ส่ง HTTP 404 Not Found
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// ส่งข้อมูลสมาชิกกลับ client ในรูปแบบ JSON
	c.JSON(http.StatusOK, member)
}

// DELETE /member/:id
func DeleteMemberById(c *gin.Context) {
	id := c.Param("id") // อ่าน user_id จาก URL path

	// ลบสมาชิกจาก database
	if err := configs.DB().Where("user_id = ?", id).Delete(&entity.User{}).Error; err != nil {
		// ถ้าเกิด error ส่ง HTTP 500
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อความยืนยันลบสำเร็จ
	c.JSON(http.StatusOK, gin.H{"message": "deleted successful"})
}
