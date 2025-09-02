package services

import(
	"errors"
	"os"
	"strings"
	"time"
	"github.com/golang-jwt/jwt/v5"
	"github.com/PIPAT-I/G10-SA/entity"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	DB *gorm.DB
}

type LoginInput struct {
	Identifier    string 
	Password     string 
}
type LoginOutput struct {
	Token string
	User  entity.User
	Role  string // ชื่อ role: "user" | "admin"
}


func issueJWT(userID, role string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "CHANGE_ME_DEV_ONLY"
	}	
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}


func (s *AuthService) Login(in LoginInput) (*LoginOutput, error) {
	var u entity.User
	q := s.DB.Preload("Role")

	if strings.Contains(in.Identifier, "@") {
		if err := q.Where("email = ?", in.Identifier).First(&u).Error; err != nil {
			return nil, errors.New("email or password incorrect")
		}
	} else {
		if err := q.Where("user_id = ?", in.Identifier).First(&u).Error; err != nil {
			return nil, errors.New("userID or password incorrect")
		}
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(in.Password)); err != nil {
		return nil, errors.New("email/userID or password incorrect")
	}

	roleName := ""
	if u.Role != nil {
		roleName = u.Role.Name // สมมติ Role.Name = "user" | "admin"
	}

	tok, err := issueJWT(u.UserID, roleName)
	if err != nil {
		return nil, errors.New("cannot issue token")
	}

	return &LoginOutput{Token: tok, User: u, Role: roleName}, nil
}
