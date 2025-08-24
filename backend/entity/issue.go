package entity

import "gorm.io/gorm"

type Issue struct {
	gorm.Model
	Title       string `json:"title"`
	Description string `json:"description"`
	FilePath    string `json:"file_path"`

	// ความสัมพันธ์กับ IssueType
	IssueTypeID uint      `gorm:"not null" json:"issue_type_id"`
	IssueType   IssueType `gorm:"foreignKey:IssueTypeID" json:"issue_type"`

	// ความสัมพันธ์กับ IssueStatus
	IssueStatusID uint        `gorm:"not null" json:"issue_status_id"`
	Status        IssueStatus `gorm:"foreignKey:IssueStatusID" json:"status"`

	// ความสัมพันธ์กับ User (แก้ไข type เป็น string)
	UserID string `gorm:"not null" json:"user_id"`
	User   User   `gorm:"foreignKey:UserID;references:UserID" json:"user"`
}
