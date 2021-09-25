package idtoken

import (
	"context"
	"fmt"
	"math/rand"
	"testing"
	"time"

	"github.com/benbjohnson/clock"
	"gotest.tools/v3/assert"
	"gotest.tools/v3/assert/cmp"
)

var defaultConfig = Config{ //nolint:gochecknoglobals
	DefaultCacheSize: 10,
	ExpiryInterval:   10 * time.Second,
}

func newFixture() (*Cache, *clock.Mock) {
	mock := clock.NewMock()
	return newWithClock(defaultConfig, mock), mock
}

func preloadCache(c map[Subject]cachedUser, load []cachedUser) {
	for _, user := range load {
		c[user.idToken.Sub] = user
	}
}

func TestCache_Get(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name             string
		timeOffset       time.Duration
		wantedSubject    Subject
		preLoad          []cachedUser
		wantPreLoadIndex int
	}{
		{
			name:             "Empty subject, empty cache",
			wantedSubject:    "",
			preLoad:          nil,
			wantPreLoadIndex: -1,
		},
		{
			name:             "Missing subject, empty cache",
			wantedSubject:    "missing-sub",
			preLoad:          nil,
			wantPreLoadIndex: -1,
		},
		{
			name:          "Expired token",
			timeOffset:    2 * time.Second,
			wantedSubject: "hello",
			preLoad: []cachedUser{
				{
					expireAt: time.UnixMilli(0),
					idToken:  &IDToken{Sub: "hello"},
				},
			},
			wantPreLoadIndex: -1,
		},
		{
			name:          "Expiry equals now()",
			timeOffset:    time.Hour,
			wantedSubject: "hello",
			preLoad: []cachedUser{
				{
					expireAt: time.UnixMilli(0).Add(time.Hour),
					idToken:  &IDToken{Sub: "hello"},
				},
			},
			wantPreLoadIndex: -1,
		},
		{
			name:          "Valid token",
			timeOffset:    0,
			wantedSubject: "valid",
			preLoad: []cachedUser{
				{
					expireAt: time.UnixMilli(0).Add(time.Hour),
					idToken:  &IDToken{Sub: "valid"},
				},
			},
			wantPreLoadIndex: 0,
		},
		{
			name:          "Multiple tokens",
			timeOffset:    0,
			wantedSubject: "valid2",
			preLoad: []cachedUser{
				{
					expireAt: time.UnixMilli(0).Add(time.Hour),
					idToken:  &IDToken{Sub: "valid"},
				},
				{
					expireAt: time.UnixMilli(0).Add(2 * time.Hour),
					idToken:  &IDToken{Sub: "valid2"},
				},
			},
			wantPreLoadIndex: 1,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			c, mock := newFixture()
			mock.Add(tt.timeOffset)

			preloadCache(c.tokens, tt.preLoad)

			gotten := c.Get(tt.wantedSubject)
			if tt.wantPreLoadIndex >= 0 {
				assert.Equal(t, gotten, tt.preLoad[tt.wantPreLoadIndex].idToken)
			} else {
				assert.Assert(t, cmp.Nil(gotten))
			}
		})
	}
}

func TestCache_GetOrSet(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name             string
		timeOffset       time.Duration
		wantedSubject    Subject
		preLoad          []cachedUser
		mappingFunc      MappingFunc
		wantPreLoadIndex int
	}{
		{
			name:          "Nil mapping func, existing token",
			timeOffset:    0,
			wantedSubject: "apabepa",
			preLoad: []cachedUser{
				{
					expireAt: time.UnixMilli(0).Add(time.Hour),
					idToken: &IDToken{
						Sub: "apabepa",
					},
				},
			},
			mappingFunc:      nil,
			wantPreLoadIndex: 0,
		},
		{
			name:             "Nil mapping func, missing token",
			timeOffset:       0,
			wantedSubject:    "apabepa",
			preLoad:          []cachedUser{},
			mappingFunc:      nil,
			wantPreLoadIndex: -1,
		},
		{
			name:          "Mapping func, existing token",
			timeOffset:    0,
			wantedSubject: "apabepa",
			preLoad: []cachedUser{
				{
					expireAt: time.UnixMilli(0).Add(time.Hour),
					idToken: &IDToken{
						Sub: "apabepa",
					},
				},
			},
			mappingFunc: func() (*IDToken, time.Time) {
				t.Fail()
				return nil, time.Time{}
			},
			wantPreLoadIndex: 0,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			c, _ := newFixture()
			preloadCache(c.tokens, tt.preLoad)

			token := c.GetOrSet(tt.wantedSubject, tt.mappingFunc)

			if tt.wantPreLoadIndex == -1 {
				if tt.mappingFunc != nil {
					expectedToken, _ := tt.mappingFunc()
					assert.Equal(t, token, expectedToken)
					for _, user := range tt.preLoad {
						assert.Check(t, func() bool { return expectedToken != user.idToken })
					}
				} else {
					assert.Assert(t, cmp.Nil(token))
				}
			} else {
				assert.Equal(t, token, tt.preLoad[tt.wantPreLoadIndex].idToken)
			}
		})
	}
}

func TestCache_GetOrSet_mappingFunc(t *testing.T) {
	t.Parallel()

	// Given
	c, _ := newFixture()

	preloadCache(c.tokens, []cachedUser{
		{
			expireAt: time.UnixMilli(0),
			idToken: &IDToken{
				Sub:   "apa",
				Email: "apa@example.org",
			},
		},
	})
	assert.Assert(t, cmp.Len(c.tokens, 1))

	// When
	newToken := &IDToken{
		Sub:   "apa",
		Email: "apabepa@example.org",
	}
	gotToken := c.GetOrSet("apa", func() (*IDToken, time.Time) {
		return newToken, time.UnixMilli(0).Add(time.Hour)
	})

	// Then
	assert.Assert(t, cmp.Len(c.tokens, 1))
	assert.Equal(t, gotToken, newToken)
	assert.Equal(t, gotToken, c.tokens["apa"].idToken)
	assert.Equal(t, c.tokens["apa"].expireAt, time.UnixMilli(0).Add(time.Hour))
}

func TestCache_deleteExpiredTokens(t *testing.T) {
	t.Parallel()
	// Given
	mock := clock.NewMock()
	c := newWithClock(defaultConfig, mock)
	preloadCache(c.tokens, genTokens(10, mock.Now()))
	assert.Assert(t, cmp.Len(c.tokens, 10))

	// When
	mock.Add(30 * time.Minute)
	deleted := c.deleteExpiredTokens()

	// Then
	assert.Equal(t, deleted, 10)
	assert.Assert(t, cmp.Len(c.tokens, 0))
}

func TestCache_deleteExpiredTokens_noExpiredTokens(t *testing.T) {
	t.Parallel()
	// Given
	c, mock := newFixture()
	preloadCache(c.tokens, genTokens(10, mock.Now().Add(time.Hour)))
	assert.Assert(t, cmp.Len(c.tokens, 10))

	// When
	deleted := c.deleteExpiredTokens()

	// Then
	assert.Equal(t, deleted, 0o0)
	assert.Assert(t, cmp.Len(c.tokens, 10))
}

func TestCache_deleteExpiredTokens_halfExpiredTokens(t *testing.T) {
	t.Parallel()
	// Given
	c, mock := newFixture()
	preloadCache(c.tokens, genTokens(3, mock.Now()))
	preloadCache(c.tokens, genTokens(7, mock.Now().Add(time.Hour)))
	assert.Assert(t, cmp.Len(c.tokens, 10))

	// When
	mock.Add(30 * time.Minute)
	deleted := c.deleteExpiredTokens()

	// Then
	assert.Equal(t, deleted, 3)
	assert.Assert(t, cmp.Len(c.tokens, 7))
}

func genTokens(amount int, expireAt time.Time) []cachedUser {
	users := make([]cachedUser, 0, amount)
	for i := 0; i < amount; i++ {
		users = append(users, cachedUser{
			expireAt: expireAt,
			idToken: &IDToken{
				Sub: Subject(fmt.Sprintf("%d", rand.Int())), //nolint:gosec
			},
		})
	}

	return users
}

func TestCache_expireTokens_cancelledContext(t *testing.T) {
	t.Parallel()

	// Given
	c, _ := newFixture()
	ctx, cancelFunc := context.WithCancel(context.Background())

	start := make(chan bool, 1)
	done := make(chan bool, 1)

	// When
	go func() {
		<-start
		c.expireTokens(ctx)
		done <- true
	}()

	assert.NilError(t, ctx.Err())
	start <- true
	assert.Assert(t, cmp.Len(done, 0))

	cancelFunc()

	// Then
	<-done
	<-ctx.Done()
	assert.ErrorType(t, ctx.Err(), context.Canceled)
}
