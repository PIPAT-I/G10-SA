package services


import (
	"errors"
	jwt "github.com/dgrijalva/jwt-go"
	"time"
)

// JwtWrapper wraps the signing key and the issuer
type JwtWrapper struct {
	SecretKey       string
	Issuer          string
	ExpirationHours int64
}

// JwtClaim adds Identifier as a claim to the token
type JwtClaim struct {
	Identifier string
	jwt.StandardClaims
}


func (j *JwtWrapper) GenerateToken(identifier string) (signedToken string, err error) {
	claims := JwtClaim{
		Identifier: identifier,
		StandardClaims: jwt.StandardClaims{
			Issuer:    j.Issuer,
			ExpiresAt: time.Now().Add(time.Duration(j.ExpirationHours) * time.Hour).Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err = token.SignedString([]byte(j.SecretKey))
	return
}

// ValidateToken validates the token and returns the claims
func (j *JwtWrapper) ValidateToken(tokenString string) (claims JwtClaim, err error) {
	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(j.SecretKey), nil
	})
	if err != nil {
		return
	}

	if !token.Valid {
		err = errors.New("invalid token")
	}

	if claims.ExpiresAt < time.Now().Local().Unix() {
		err = errors.New("JWT expired")
		return
	}

	return
}