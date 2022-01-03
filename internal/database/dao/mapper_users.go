package dao

import "github.com/filmstund/filmstund/internal/graph/model"

func (gc *GiftCertificate) GraphModel(status model.GiftCertificateStatus) *model.GiftCertificate {
	return &model.GiftCertificate{
		Number:     gc.Number,
		ExpireTime: gc.ExpireTime,
		Status:     status,
	}
}
