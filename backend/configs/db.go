package configs

import (
	"fmt"
	"log"

	"github.com/PIPAT-I/G10-SA/entity"
	"golang.org/x/crypto/bcrypt" // สำหรับ hash password
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

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
	CreateDefaultCategory()
	CreateDefaultAuthor()
	CreateDefaultFileType()
	CreateDefaultPublisher()
	

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
	passwordUser, _ := bcrypt.GenerateFromPassword([]byte(defaultUserPassword), 10)

	defaultAdminPassword := "admin123"
	passwordAdmin, _ := bcrypt.GenerateFromPassword([]byte(defaultAdminPassword), 10)

	
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

// GetDB ส่งคืน database instance สำหรับการใช้งานในที่อื่นๆ
func GetDB() *gorm.DB {
	return db
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











