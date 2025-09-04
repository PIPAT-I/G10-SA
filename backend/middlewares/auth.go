package middlewares

import (
	"net/http"
	"github.com/PIPAT-I/G10-SA/services"
	"strings"
	"github.com/gin-gonic/gin"
)

var Hashkey = []byte("SECRET-KEY")
var Blockkey = []byte("SECRET-BLOCK-KEY")

// AuthRequired - ตรวจสอบ JWT Token และตั้งค่า user context
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientToken := c.Request.Header.Get("Authorization")
		if clientToken == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
			return
		}
		extractedToken := strings.Split(clientToken, "Bearer ")
		if len(extractedToken) == 2 {
			clientToken = strings.TrimSpace(extractedToken[1])
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format of Authorization Token"})
			return
		}

		jwtWrapper := services.JwtWrapper{
			SecretKey: "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
			Issuer:    "AuthService",
		}

		claims, err := jwtWrapper.ValidateToken(clientToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return

		}

		c.Set("identifier", claims.Identifier)
		c.Next()
	}
}
