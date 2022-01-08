package dataloader

import (
	"context"
	"fmt"
	"time"

	"github.com/filmstund/filmstund/internal/database"
	"github.com/filmstund/filmstund/internal/database/dao"
	"github.com/filmstund/filmstund/internal/graph/model"
	"github.com/google/uuid"
)

type contextKey string

const dataloaderKey = contextKey("dataloader")

func WithContext(parent context.Context, loaders *Loaders) context.Context {
	return context.WithValue(parent, dataloaderKey, loaders)
}

func FromContext(ctx context.Context) *Loaders {
	value := ctx.Value(dataloaderKey)
	if val, ok := value.(*Loaders); ok {
		return val
	}
	panic(fmt.Errorf("no dataloader stored in the context"))
}

type Loaders struct {
	PublicUserLoader
}

func NewLoaders(ctx context.Context) *Loaders {
	return &Loaders{
		PublicUserLoader: newPublicUserLoader(ctx),
	}
}

func newPublicUserLoader(ctx context.Context) PublicUserLoader {
	return PublicUserLoader{
		wait:     1 * time.Millisecond,
		maxBatch: 25,
		fetch: func(keys []uuid.UUID) ([]*model.PublicUser, []error) {
			models := make([]*model.PublicUser, len(keys))
			query := database.FromContext(ctx)

			users, err := query.ListPublicUsers(ctx, keys)
			if err != nil {
				return nil, []error{
					err,
				}
			}
			lookup := func(key uuid.UUID) *model.PublicUser {
				for _, user := range users {
					if user.ID == key {
						return &model.PublicUser{
							ID:        user.ID,
							Name:      user.Name,
							FirstName: user.FirstName,
							LastName:  user.LastName,
							Nick:      dao.NullString(user.Nick),
							Phone:     dao.NullString(user.Phone),
							AvatarURL: dao.NullString(user.AvatarURL),
						}
					}
				}
				return nil
			}

			// the PublicUser at index i in models needs to match the key in keys at index i.
			// since we can't guarantee that from what the DB returns, we have the lookup func above.
			for i, key := range keys {
				models[i] = lookup(key)
			}
			return models, nil
		},
	}
}
