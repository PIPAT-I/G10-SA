package entity

import(
	"gorm.io/gorm"
)

type ReviewVote struct {
	gorm.Model
	ReviewID     uint
	Review       Review `gorm:"foreignKey:ReviewID" json:"review"`

	UserID     string
	User       User `gorm:"foreignKey:UserID;references:UserID" json:"user"`

	ReviewVoteTypeID uint
	ReviewVoteType   ReviewVoteType `gorm:"foreignKey:ReviewVoteTypeID" json:"review_vote_type"`
}