package controllers

import (
	"net/http"

	"github.com/PIPAT-I/G10-SA/configs"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/PIPAT-I/G10-SA/services"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// LoginPayload login body
type LoginPayload struct {
	UserID string `json:"user_id"`
	Password string `json:"password"`
}

// LoginResponse token response
type LoginResponse struct {
    Token string `json:"token"`
    ID    string `json:"id"` // เปลี่ยนจาก uint → string
}

// POST /login member
func LoginMember(c *gin.Context) {
	var payload LoginPayload
	var member entity.User

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ค้นหา user ด้วย UserID
	if err := configs.DB().Where("user_id = ?", payload.UserID).First(&member).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user not found"})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if err := bcrypt.CompareHashAndPassword([]byte(member.Password), []byte(payload.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	// สร้าง JWT
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	signedToken, err := jwtWrapper.GenerateToken(member.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error signing token"})
		return
	}

	// ส่ง Response
	tokenResponse := LoginResponse{
		Token: signedToken,
		ID:    member.UserID,
	}

	c.JSON(http.StatusOK, gin.H{"data": tokenResponse})
}


