package models

import "gorm.io/gorm"

type Roadmap struct {
	gorm.Model
	UserEmail string        `json:"user_email"`
	Goal      string        `json:"goal"`
	Title     string        `json:"title"` // Add this line
	Weeks     []RoadmapWeek `json:"weeks" gorm:"foreignKey:RoadmapID"`
}

type RoadmapWeek struct {
	gorm.Model
	RoadmapID uint   `json:"-"`
	Week      int    `json:"week"`
	Title     string `json:"title"`
	Topics    string `json:"topics"`
	Progress  string `json:"progress"`
}
