package entity

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	CategoryName string `gorm:"not null" json:"category_name"`
	CategoryCode string `gorm:"not null;unique" json:"category_code"`
	Description  string `gorm:"type:text" json:"description"`

	UserID string `gorm:"not null" json:"user_id"`
	User   User   `gorm:"foreignKey:UserID;references:UserID" json:"user"`

	// ความสัมพันธ์ 1-1 กับ CategoryStatics
	CategoryStaticsID uint              `gorm:"not null;uniqueIndex" json:"category_statics_id"`
    CategoryStatics   *CategoryStatics  `gorm:"foreignKey:CategoryStaticsID;references:ID" json:"category_statics"`
}

