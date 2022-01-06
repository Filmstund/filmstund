package dao

import (
	"github.com/filmstund/filmstund/internal/graph/model"
)

func (gc *GiftCertificate) GraphModel(status model.GiftCertificateStatus) *model.GiftCertificate {
	return &model.GiftCertificate{
		Number:     gc.Number,
		ExpireTime: gc.ExpireTime,
		Status:     status,
	}
}

func (pu PublicUserRow) GraphModel() *model.PublicUser {
	return &model.PublicUser{
		ID:        pu.ID,
		Name:      pu.Name,
		FirstName: pu.FirstName,
		LastName:  pu.LastName,
		Nick:      nullString(pu.Nick),
		Phone:     nullString(pu.Phone),
		AvatarURL: nullString(pu.AvatarURL),
	}
}
