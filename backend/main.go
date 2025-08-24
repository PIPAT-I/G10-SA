package main

import (
	"fmt"
	"log"

	"github.com/PIPAT-I/G10-SA/configs"
)

func main() {
	fmt.Println("Starting SA-G10 Library Management System...")

	// เชื่อมต่อฐานข้อมูลและทำ migration + seeding
	configs.ConnectDatabase()

	fmt.Println("Database setup completed!")


	log.Println("Application started successfully!")
}
