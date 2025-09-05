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
		&entity.BorrowPolicy{},
	)

	// เพิ่มข้อมูลเริ่มต้น
	createDefaultRoles()
	
	createDefaultUsers()
	CreateDefaultBookStatus()
	CreateDefaultReservationStatus()
	CreateDefaultPublishers()
	CreateDefaultLanguages()
	CreateDefaultFileTypes()
	CreateDefaultAuthors()
	CreateDefaultBooks()
	createDefaultBorrowPolicies()
	CacheBookStatusIDs()
	CreateBookLicensesForBook(1, 3) // สร้าง BookLicense 3 ชุด สำหรับ Book ID 1
	CreateBookLicensesForBook(2, 2) // สร้าง BookLicense 2 ชุด สำหรับ Book ID 2
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
			RoleID:           1,
		},
		{
			UserID:           "S002",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 2",
			Lastname:         "นามสกุล 2",
			Email:            "email2@example.com",
			PhoneNumber:      "0801234568",
			RoleID:           1,
		},
		{
			UserID:           "S003",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 3",
			Lastname:         "นามสกุล 3",
			Email:            "email3@example.com",
			PhoneNumber:      "0801234569",
			RoleID:           1,
		},
		{
			UserID:           "S004",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 4",
			Lastname:         "นามสกุล 4",
			Email:            "email4@example.com",
			PhoneNumber:      "0801234570",
			RoleID:           1,
		},
		{
			UserID:           "S005",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 5",
			Lastname:         "นามสกุล 5",
			Email:            "email5@example.com",
			PhoneNumber:      "0801234571",
			RoleID:           1,
		},
		{
			UserID:           "S006",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 6",
			Lastname:         "นามสกุล 6",
			Email:            "email6@example.com",
			PhoneNumber:      "0801234572",
			RoleID:           1,
		},
		{
			UserID:           "S007",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 7",
			Lastname:         "นามสกุล 7",
			Email:            "email7@example.com",
			PhoneNumber:      "0801234573",
			RoleID:           1,
		},
		{
			UserID:           "S008",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 8",
			Lastname:         "นามสกุล 8",
			Email:            "email8@example.com",
			PhoneNumber:      "0801234574",
			RoleID:           1,
		},
		{
			UserID:           "S009",
			Password:         string(passwordUser),
			Firstname:        "ชื่อจริง 9",
			Lastname:         "นามสกุล 9",
			Email:            "email9@example.com",
			PhoneNumber:      "0801234575",
			RoleID:           1,
		},
		{
			UserID:           "S010",
			Password:         string(passwordAdmin),
			Firstname:        "Admin",
			Lastname:         "SA-libary",
			Email:            "email10@example.com",
			PhoneNumber:      "0801234576",
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
			Title:         "เที่ยวสวิสเซอร์แลนด์",
			TotalPage:     220,
			Synopsis:      "คู่มือท่องเที่ยวประเทศสวิสเซอร์แลนด์ ครอบคลุมสถานที่ท่องเที่ยวที่น่าสนใจ วัฒนธรรมท้องถิ่น และเคล็ดลับการเดินทางที่จะทำให้ทริปของคุณน่าจดจำ",
			Isbn:          "9786169890123",
			CoverImage:    "/static/covers/book4.jpg",
			EbookFile:     "/static/ebooks/book4.epub",
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
	
	// เชื่อม Authors กับ Books (many-to-many relationship)
	linkAuthorsToBooks()
}

func linkAuthorsToBooks() {
	// เชื่อม Authors กับ Books
	authorBookLinks := map[string][]string{
		"เก่งรอดของจิวรา": {"จิวลักษณ์ ภู่ทอง"},
		"รูปข่าวกับก่อสร้าง": {"ดิจิต้า"},
		"นักเรียนกับการประวัติ": {"ประวัติกร"},
		"เที่ยวสวิสเซอร์แลนด์": {"ลุยทริป"},
		"The Human Cosmos": {"Jo Marchant"},
	}

	for bookTitle, authorNames := range authorBookLinks {
		var book entity.Book
		if err := db.Where("title = ?", bookTitle).First(&book).Error; err != nil {
			fmt.Printf("Book '%s' not found\n", bookTitle)
			continue
		}

		for _, authorName := range authorNames {
			var author entity.Author
			if err := db.Where("author_name = ?", authorName).First(&author).Error; err != nil {
				fmt.Printf("Author '%s' not found\n", authorName)
				continue
			}

			// เชื่อม Author กับ Book
			if err := db.Model(&book).Association("Authors").Append(&author); err != nil {
				fmt.Printf("Error linking author '%s' to book '%s': %v\n", authorName, bookTitle, err)
			} else {
				fmt.Printf("Linked author '%s' to book '%s'\n", authorName, bookTitle)
			}
		}
	}
}


func createDefaultBorrowPolicies() {
	borrowPolicies := []entity.BorrowPolicy{
		{RoleID: 1, MaxBorrowDay: 7, MaxBorrowBook: 2, HoldHour: 3}, // Policy for 'user' role
		{RoleID: 2, MaxBorrowDay: 14, MaxBorrowBook: 5, HoldHour: 24}, // Policy for 'admin' role
	}

	for _, policy := range borrowPolicies {
		db.FirstOrCreate(&policy, entity.BorrowPolicy{RoleID: policy.RoleID})
		fmt.Printf("Borrow policy for role ID %d ready\n", policy.RoleID)
	}
}


var StatusID struct{
    Available uint
    Borrowed  uint
    Hold      uint
}

func CacheBookStatusIDs() error {
    var s entity.BookStatus

    if err := db.Where("status_name = ?", "Available").First(&s).Error; err != nil { return err }
    StatusID.Available = s.ID

    if err := db.Where("status_name = ?", "Borrowed").First(&s).Error; err != nil { return err }
    StatusID.Borrowed = s.ID

    if err := db.Where("status_name = ?", "Hold").First(&s).Error; err != nil { return err }
    StatusID.Hold = s.ID

    return nil
}

func CreateBookLicensesForBook(bookID uint, count int) error {
	if count <= 0 {
		count = 1
	}
	availableID := StatusID.Available

	// ตรวจว่า book มีจริง
	var b entity.Book
	if err := db.First(&b, bookID).Error; err != nil {
		return err
	}

	for i := 0; i < count; i++ {
		lic := entity.BookLicense{
			BookID:       b.ID,
			BookStatusID: availableID,
		}
		if err := db.Create(&lic).Error; err != nil {
			return err
		}
	}
	fmt.Printf("Created %d license(s) for Book #%d\n", count, bookID)
	return nil
}
