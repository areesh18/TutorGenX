package utils

import (
	"errors"
	"os"
	"time"
	"github.com/golang-jwt/jwt/v5"
)

func CreateToken(email, name string)(string,error){
	claims := jwt.MapClaims{
		"email":email,
		"name":name,
		"exp":jwt.NewNumericDate(time.Now().Add(24*time.Hour)),
	}
	token:=jwt.NewWithClaims(jwt.SigningMethodHS256,claims)

	secret :=os.Getenv("JWT_SECRET")
	if secret == ""{
		return "",errors.New("JWT_SECRET not found in .env")
	}
	return token.SignedString([]byte(secret))
}