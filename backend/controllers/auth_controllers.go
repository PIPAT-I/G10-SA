package controllers

import (
    "net/http"
    "github.com/PIPAT-I/G10-SA/services"
    "github.com/gin-gonic/gin"
)

type AuthController struct{ Svc *services.AuthService }

type loginReq struct {
    Identifier string `json:"identifier" binding:"required"` // email หรือ userID
    Password   string `json:"password"  binding:"required"`
}

func (a *AuthController) Login(c *gin.Context) {
    var in loginReq
    if err := c.ShouldBindJSON(&in); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
        return
    }
    out, err := a.Svc.Login(services.LoginInput{Identifier: in.Identifier, Password: in.Password})
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{
        "token": out.Token,
        "user": gin.H{
            // ใช้ camelCase ให้ตรงกับฝั่ง frontend
            "userID":    out.User.UserID,
            "email":     out.User.Email,
            "firstname": out.User.Firstname,
            "lastname":  out.User.Lastname,
            "phone":     out.User.PhoneNumber,
            "role":      out.Role, // "user" | "admin"
        },
    })
}
