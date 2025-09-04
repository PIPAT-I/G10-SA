package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/PIPAT-I/G10-SA/config"
	"github.com/PIPAT-I/G10-SA/entity"
	"github.com/PIPAT-I/G10-SA/services"
	"golang.org/x/crypto/bcrypt"
)

type loginReq struct {
	Identifier string `json:"identifier" binding:"required"` // email หรือ userID
	Password   string `json:"password"  binding:"required"`
}

func Login(c *gin.Context) {
	var payload loginReq
	var user entity.User
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	//เช็ค id และ preload role
	if err := config.DB().Preload("Role").Where("email = ? OR user_id = ? ", payload.Identifier, payload.Identifier).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "email/userID not found"})
		return
	}

	// เช็ค password
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password))

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "incorrect password"})
		return
	}

	// สร้าง token
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}
	signedToken, err := jwtWrapper.GenerateToken(user.UserID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error signing token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token_type": "Bearer",
		"token":      signedToken,
		"user": gin.H{
			"id":         user.UserID,
			"first_name": user.Firstname,
			"last_name":  user.Lastname,
			"email":      user.Email,
			"role":       user.Role.Name, // แสดงชื่อ role
		},
	})
}
