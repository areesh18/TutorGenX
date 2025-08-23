package db

import (
	"fmt"
	"log"
	"tutor_genX/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	//connect to db
	dsn := "host=localhost user=postgres password=postgres123 dbname=tutorgenx port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect:", err)
	}
	DB = db

	db.AutoMigrate(&models.User{}, &models.Roadmap{}, &models.RoadmapWeek{}, &models.Content{})

	fmt.Println("✅ Database connected and User table migrated!")
}
