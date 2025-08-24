package entity

import (
	"gorm.io/gorm"
)

type Book struct {
	gorm.Model
	Title           string `gorm:"not null" json:"title"`
	TotalPage       uint   `gorm:"not null" json:"total_page"`
	Synopsis        string `gorm:"type:text" json:"synopsis"`
	Isbn            string `gorm:"unique;not null" json:"isbn"`
	CoverImage      string `json:"cover_image"`
	EbookFile       string `json:"ebook_file"`
	PublishedYear   uint   `gorm:"not null" json:"published_year"`

	

	PublisherID uint        `gorm:"not null" json:"publisher_id"`
	Publisher   *Publishers `gorm:"foreignKey:PublisherID" json:"publisher"`
	LanguageID  uint        `gorm:"not null" json:"language_id"`
	Language    *Languages  `gorm:"foreignKey:LanguageID" json:"language"`
	FileTypeID  uint        `gorm:"not null" json:"file_type_id"`
	FileType    *FileTypes  `gorm:"foreignKey:FileTypeID" json:"file_type"`
	UserID      string      `gorm:"not null" json:"user_id"`
	User        *User       `gorm:"foreignKey:UserID;references:UserID" json:"user"`

	Categories        []Category         `gorm:"many2many:category_book;" json:"category"`
	Authors           []Author           `gorm:"many2many:book_author;" json:"authors"`
	BookLicenses      []BookLicense      `gorm:"foreignKey:BookID" json:"book_licenses"`
	Reservations      []Reservation      `gorm:"foreignKey:BookID" json:"reservations"`
	Borrows           []Borrow          `gorm:"foreignKey:BookID" json:"borrows"`
	ReadingActivities []ReadingActivity `gorm:"foreignKey:BookID" json:"reading_activities"`
	Reviews           []Review          `gorm:"foreignKey:BookID" json:"reviews"`
	Booklists         []Booklist        `gorm:"many2many:booklist_books;" json:"booklists"`
}
