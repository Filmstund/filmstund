// Code generated by sqlc. DO NOT EDIT.

package sqlc

import (
	"time"
)

type Commandment struct {
	Number      int32     `json:"number"`
	Phrase      string    `json:"phrase"`
	CreatedDate time.Time `json:"createdDate"`
}