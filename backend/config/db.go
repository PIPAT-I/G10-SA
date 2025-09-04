package config

import (
	"fmt"
	"log"
	"github.com/PIPAT-I/G10-SA/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

// ConnectDatabase เชื่อมต่อฐานข้อมูล
func ConnectDatabase() {
	var err error

	// เชื่อมต่อกับฐานข้อมูล SQLite
	db, err = gorm.Open(sqlite.Open("libary-system.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Database connected successfully!")

	SetupDatabase()
}

// SetupDatabase ทำการตั้งค่าฐานข้อมูล
func SetupDatabase() {
	// Auto-migrate ตาราง entities ทั้งหมด
	db.AutoMigrate(
		&entity.User{},
		&entity.Role{},
		&entity.Book{},
		&entity.Author{},
		&entity.Category{},
		&entity.CategoryStatics{},
		&entity.Languages{},
		&entity.Publishers{},
		&entity.BookStatus{},
		&entity.BookLicense{},
		&entity.BorrowingLimit{},
		&entity.Borrow{},
		&entity.ReadingActivity{},
		&entity.Reservation{},
		&entity.ReservationStatus{},
		&entity.Review{},
		&entity.Booklist{},
		&entity.Profile{},
		&entity.Issue{},
		&entity.IssueType{},
		&entity.IssueStatus{},
		&entity.Announcement{},
		&entity.AnnouncementCategory{},
		&entity.Announcement_Read{},
		&entity.Notification{},
		&entity.FileTypes{},
		&entity.FileAttachment{},
		&entity.ReviewVoteType{},
		&entity.ReviewReply{},
		&entity.ReviewVote{},
		&entity.NotificationType{},
	)

	// เพิ่มข้อมูลเริ่มต้น
	createDefaultRoles()
	createDefaultBorrowingLimits()
	createDefaultUsers()
	CreateDefaultBookStatus()
	CreateDefaultReservationStatus()
	CreateDefaultPublishers()
	CreateDefaultLanguages()
	CreateDefaultFileTypes()
	CreateDefaultAuthors()
	CreateDefaultBooks()
}

// createDefaultRoles สร้าง roles เริ่มต้น: user และ admin
func createDefaultRoles() {
	// สร้าง roles เริ่มต้น
	roles := []entity.Role{
		{Name: "user"},
		{Name: "admin"},
	}

	for _, role := range roles {
		db.FirstOrCreate(&role, entity.Role{Name: role.Name})
		fmt.Printf("Role '%s' ready\n", role.Name)
	}
}

// createDefaultBorrowingLimits สร้าง borrowing limits เริ่มต้น
func createDefaultBorrowingLimits() {
	// สร้าง borrowing limits เริ่มต้น
	limits := []entity.BorrowingLimit{
		{LimitNumber: 2},
		{LimitNumber: 3},
		{LimitNumber: 5},
	}

	for _, limit := range limits {
		db.FirstOrCreate(&limit, entity.BorrowingLimit{LimitNumber: limit.LimitNumber})
		fmt.Printf("Borrowing limit %d books ready\n", limit.LimitNumber)
	}
}

// createDefaultUsers สร้าง users เริ่มต้น (ข้อมูลพนักงานในองค์กร)
func createDefaultUsers() {

	defaultUserPassword := "123456"
	passwordUser, _ := HashPassword(defaultUserPassword)

	defaultAdminPassword := "admin123"
	passwordAdmin,_ := HashPassword(defaultAdminPassword)

	users := []entity.User{
		{
			UserID:           "S001",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 1",
			Lastname:         "นามสกุล 1",
			Email:            "email1@example.com",
			PhoneNumber:      "0801234567",
			BorrowingLimitID: 1,
			RoleID:           1,
		},
		{
			UserID:           "S002",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 2",
			Lastname:         "นามสกุล 2",
			Email:            "email2@example.com",
			PhoneNumber:      "0801234568",
			BorrowingLimitID: 2,
			RoleID:           1,
		},
		{
			UserID:           "S003",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 3",
			Lastname:         "นามสกุล 3",
			Email:            "email3@example.com",
			PhoneNumber:      "0801234569",
			BorrowingLimitID: 3,
			RoleID:           1,
		},
		{
			UserID:           "S004",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 4",
			Lastname:         "นามสกุล 4",
			Email:            "email4@example.com",
			PhoneNumber:      "0801234570",
			BorrowingLimitID: 1,
			RoleID:           1,
		},
		{
			UserID:           "S005",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 5",
			Lastname:         "นามสกุล 5",
			Email:            "email5@example.com",
			PhoneNumber:      "0801234571",
			BorrowingLimitID: 2,
			RoleID:           1,
		},
		{
			UserID:           "S006",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 6",
			Lastname:         "นามสกุล 6",
			Email:            "email6@example.com",
			PhoneNumber:      "0801234572",
			BorrowingLimitID: 3,
			RoleID:           1,
		},
		{
			UserID:           "S007",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 7",
			Lastname:         "นามสกุล 7",
			Email:            "email7@example.com",
			PhoneNumber:      "0801234573",
			BorrowingLimitID: 1,
			RoleID:           1,
		},
		{
			UserID:           "S008",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 8",
			Lastname:         "นามสกุล 8",
			Email:            "email8@example.com",
			PhoneNumber:      "0801234574",
			BorrowingLimitID: 2,
			RoleID:           1,
		},
		{
			UserID:           "S009",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 9",
			Lastname:         "นามสกุล 9",
			Email:            "email9@example.com",
			PhoneNumber:      "0801234575",
			BorrowingLimitID: 3,
			RoleID:           1,
		},
		{
			UserID:           "S010",
			Password:         string(passwordAdmin),
			Firstname:        "Admin",
			Lastname:         "SA-libary",
			Email:            "email10@example.com",
			PhoneNumber:      "0801234576",
			BorrowingLimitID: 1,
			RoleID:           2,
		},
	}

	for _, user := range users {
		db.FirstOrCreate(&user, entity.User{UserID: user.UserID})
		fmt.Printf("User '%s' ready\n", user.UserID)
	}
}


func CreateDefaultBookStatus() {
	defaultBookStatuses := []entity.BookStatus{
		{StatusName: "Available"},
		{StatusName: "Borrowed"},
		{StatusName: "Hold"},
	}

	for _, status := range defaultBookStatuses {
		db.FirstOrCreate(&status, entity.BookStatus{StatusName: status.StatusName})
		fmt.Printf("Book status '%s' ready\n", status.StatusName)
	}
}

func CreateDefaultReservationStatus() {
	defaultReservationStatuses := []entity.ReservationStatus{
		{StatusName: "Waiting"},
		{StatusName: "Notified"},
		{StatusName: "Fulfilled"},
		{StatusName: "Expired"},
		{StatusName: "Cancelled"},
	}

	for _, status := range defaultReservationStatuses {
		db.FirstOrCreate(&status, entity.ReservationStatus{StatusName: status.StatusName})
		fmt.Printf("Reservation status '%s' ready\n", status.StatusName)
	}
}

func CreateDefaultPublishers() {
	defaultPublishers := []entity.Publishers{
		{PublisherName: "สำนักพิมพ์มติชน"},
		{PublisherName: "สำนักพิมพ์แสงดาว"},
		{PublisherName: "โรงเรียนการศึกษา"},
		{PublisherName: "นานมีบุ๊คส์"},
		{PublisherName: "Penguin Books"},
		{PublisherName: "สำนักพิมพ์อมรินทร์"},
		{PublisherName: "สำนักพิมพ์วิภาษา"},
	}

	for _, publisher := range defaultPublishers {
		db.FirstOrCreate(&publisher, entity.Publishers{PublisherName: publisher.PublisherName})
		fmt.Printf("Publisher '%s' ready\n", publisher.PublisherName)
	}
}

func CreateDefaultLanguages() {
	defaultLanguages := []entity.Languages{
		{Name: "ไทย"},
		{Name: "English"},
	}

	for _, language := range defaultLanguages {
		db.FirstOrCreate(&language, entity.Languages{Name: language.Name})
		fmt.Printf("Language '%s' ready\n", language.Name)
	}
}

func CreateDefaultFileTypes() {
	defaultFileTypes := []entity.FileTypes{
		{TypeName: "PDF"},
		{TypeName: "EPUB"},
	}

	for _, fileType := range defaultFileTypes {
		db.FirstOrCreate(&fileType, entity.FileTypes{TypeName: fileType.TypeName})
		fmt.Printf("File type '%s' ready\n", fileType.TypeName)
	}
}

func CreateDefaultAuthors() {
	defaultAuthors := []entity.Author{
		{AuthorName: "จิวลักษณ์ ภู่ทอง"},
		{AuthorName: "ดิจิต้า"},
		{AuthorName: "ประวัติกร"},
		{AuthorName: "ลุยทริป"},
		{AuthorName: "Jo Marchant"},
		{AuthorName: "ศ.ดร.วิทยา นาควัชระ"},
		{AuthorName: "อาจารย์สมชาย ใจดี"},
		{AuthorName: "คุณหญิงปรีดา สุขใจ"},
	}

	for _, author := range defaultAuthors {
		db.FirstOrCreate(&author, entity.Author{AuthorName: author.AuthorName})
		fmt.Printf("Author '%s' ready\n", author.AuthorName)
	}
}

func CreateDefaultBooks() {
	defaultBooks := []entity.Book{
		{
			Title:         "เก่งรอดของจิวรา",
			TotalPage:     320,
			Synopsis:      "นิยายที่เล่าเรื่องราวของเด็กหญิงที่ต้องต่อสู้เพื่อความอยู่รอด ในสถานการณ์ที่ท้าทายและเต็มไปด้วยอุปสรรค ด้วยไหวพริบและความเก่งกาจของเธอ",
			Isbn:          "9786169234567",
			CoverImage:    "/static/covers/book1.jpg",
			EbookFile:     "/static/ebooks/book1.pdf",
			PublishedYear: 2023,
			PublisherID:   1,      // สำนักพิมพ์มติชน
			LanguageID:    1,      // ไทย
			FileTypeID:    1,      // PDF
			UserID:        "S010", // Admin
		},
		{
			Title:         "รูปข่าวกับก่อสร้าง",
			TotalPage:     280,
			Synopsis:      "เรื่องราวการสื่อสารข่าวสารในยุคดิจิทัล การสร้างเนื้อหาที่มีคุณภาพ และการใช้เทคโนโลยีในการนำเสนอข้อมูลอย่างมีประสิทธิภาพ",
			Isbn:          "9786169456789",
			CoverImage:    "/static/covers/book2.jpg",
			EbookFile:     "/static/ebooks/book2.epub",
			PublishedYear: 2023,
			PublisherID:   2,      // สำนักพิมพ์แสงดาว
			LanguageID:    1,      // ไทย
			FileTypeID:    2,      // EPUB
			UserID:        "S010", // Admin
		},
		{
			Title:         "นักเรียนกับการประวัติ",
			TotalPage:     450,
			Synopsis:      "การศึกษาประวัติศาสตร์แบบใหม่สำหรับนักเรียน ที่เน้นการเรียนรู้ผ่านกิจกรรมและการค้นคว้าด้วยตนเอง เพื่อให้เข้าใจบริบททางประวัติศาสตร์อย่างลึกซึ้ง",
			Isbn:          "9786169678901",
			CoverImage:    "/static/covers/book3.jpg",
			EbookFile:     "/static/ebooks/book3.pdf",
			PublishedYear: 2022,
			PublisherID:   3,      // โรงเรียนการศึกษา
			LanguageID:    1,      // ไทย
			FileTypeID:    1,      // PDF
			UserID:        "S010", // Admin
		},
		{
			Title:         "Visit SWISS เก็บๆ",
			TotalPage:     220,
			Synopsis:      "คู่มือท่องเที่ยวประเทศสวิสเซอร์แลนด์ ครอบคลุมสถานที่ท่องเที่ยวที่น่าสนใจ วัฒนธรรมท้องถิ่น และเคล็ดลับการเดินทางที่จะทำให้ทริปของคุณน่าจดจำ",
			Isbn:          "9786169890123",
			CoverImage:    "/static/covers/book4.jpg",
			EbookFile:     "/static/ebooks/book4.pdf",
			PublishedYear: 2024,
			PublisherID:   4,      // นานมีบุ๊คส์
			LanguageID:    1,      // ไทย
			FileTypeID:    1,      // PDF
			UserID:        "S010", // Admin
		},
		{
			Title:         "The Human Cosmos",
			TotalPage:     380,
			Synopsis:      "A journey through the universe and human consciousness. Exploring how ancient civilizations understood the cosmos and how modern science continues to unravel the mysteries of our place in the universe.",
			Isbn:          "9786169012345",
			CoverImage:    "/static/covers/book5.jpg",
			EbookFile:     "/static/ebooks/book5.epub",
			PublishedYear: 2021,
			PublisherID:   5,      // Penguin Books
			LanguageID:    2,      // English
			FileTypeID:    2,      // EPUB
			UserID:        "S010", // Admin
		},
	}

	for _, book := range defaultBooks {
		db.FirstOrCreate(&book, entity.Book{Isbn: book.Isbn})
		fmt.Printf("Book '%s' ready\n", book.Title)
	}
	
}


