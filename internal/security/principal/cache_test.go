package principal

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

func preloadCache(c map[Subject]*Principal, load []*Principal) {
	for _, p := range load {
		c[p.Sub] = p
	}
}

func TestCache_Get(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name             string
		timeOffset       time.Duration
		wantedSubject    Subject
		preLoad          []*Principal
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
			name:          "Expired principal",
			timeOffset:    2 * time.Second,
			wantedSubject: "hello",
			preLoad: []*Principal{
				{Sub: "hello", ExpiresAt: time.UnixMilli(0)},
			},
			wantPreLoadIndex: -1,
		},
		{
			name:          "Expiry equals now()",
			timeOffset:    time.Hour,
			wantedSubject: "hello",
			preLoad: []*Principal{
				{
					Sub:       "hello",
					ExpiresAt: time.UnixMilli(0).Add(time.Hour),
				},
			},
			wantPreLoadIndex: -1,
		},
		{
			name:          "Valid principal",
			timeOffset:    0,
			wantedSubject: "valid",
			preLoad: []*Principal{
				{
					Sub:       "valid",
					ExpiresAt: time.UnixMilli(0).Add(time.Hour),
				},
			},
			wantPreLoadIndex: 0,
		},
		{
			name:          "Multiple principals",
			timeOffset:    0,
			wantedSubject: "valid2",
			preLoad: []*Principal{
				{
					Sub:       "valid",
					ExpiresAt: time.UnixMilli(0).Add(time.Hour),
				},

				{
					Sub:       "valid2",
					ExpiresAt: time.UnixMilli(0).Add(2 * time.Hour),
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

			preloadCache(c.principals, tt.preLoad)

			gotten := c.Get(tt.wantedSubject)
			if tt.wantPreLoadIndex >= 0 {
				assert.Equal(t, gotten, tt.preLoad[tt.wantPreLoadIndex])
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
		preLoad          []*Principal
		mappingFunc      MappingFunc
		wantPreLoadIndex int
	}{
		{
			name:          "Nil mapping func, existing principal",
			timeOffset:    0,
			wantedSubject: "apabepa",
			preLoad: []*Principal{
				{
					Sub:       "apabepa",
					ExpiresAt: time.UnixMilli(0).Add(time.Hour),
				},
			},
			mappingFunc:      nil,
			wantPreLoadIndex: 0,
		},
		{
			name:             "Nil mapping func, missing principal",
			timeOffset:       0,
			wantedSubject:    "apabepa",
			preLoad:          []*Principal{},
			mappingFunc:      nil,
			wantPreLoadIndex: -1,
		},
		{
			name:          "Mapping func, existing principal",
			timeOffset:    0,
			wantedSubject: "apabepa",
			preLoad: []*Principal{
				{
					Sub:       "apabepa",
					ExpiresAt: time.UnixMilli(0).Add(time.Hour),
				},
			},
			mappingFunc: func() *Principal {
				t.Fail()
				return nil
			},
			wantPreLoadIndex: 0,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			c, _ := newFixture()
			preloadCache(c.principals, tt.preLoad)

			prin := c.GetOrSet(tt.wantedSubject, tt.mappingFunc)

			if tt.wantPreLoadIndex == -1 {
				if tt.mappingFunc != nil {
					expectedPrin := tt.mappingFunc()
					assert.Equal(t, prin, expectedPrin)
					for _, cache := range tt.preLoad {
						assert.Check(t, func() bool { return expectedPrin != cache })
					}
				} else {
					assert.Assert(t, cmp.Nil(prin))
				}
			} else {
				assert.Equal(t, prin, tt.preLoad[tt.wantPreLoadIndex])
			}
		})
	}
}

func TestCache_GetOrSet_mappingFunc(t *testing.T) {
	t.Parallel()

	// Given
	c, _ := newFixture()

	preloadCache(c.principals, []*Principal{
		{
			Sub:       "apa",
			Email:     "apa@example.org",
			ExpiresAt: time.UnixMilli(0),
		},
	})
	assert.Assert(t, cmp.Len(c.principals, 1))

	// When
	newPrin := &Principal{
		Sub:       "apa",
		Email:     "apabepa@example.org",
		ExpiresAt: time.UnixMilli(0).Add(time.Hour),
	}
	gotPrin := c.GetOrSet("apa", func() *Principal {
		return newPrin
	})

	// Then
	assert.Assert(t, cmp.Len(c.principals, 1))
	assert.Equal(t, gotPrin, newPrin)
	assert.Equal(t, gotPrin, c.principals["apa"])
	assert.Equal(t, c.principals["apa"].ExpiresAt, time.UnixMilli(0).Add(time.Hour))
}

func TestCache_deleteExpiredPrin(t *testing.T) {
	t.Parallel()
	// Given
	mock := clock.NewMock()
	c := newWithClock(defaultConfig, mock)
	preloadCache(c.principals, genPrincipals(10, mock.Now()))
	assert.Assert(t, cmp.Len(c.principals, 10))

	// When
	mock.Add(30 * time.Minute)
	deleted := c.deleteExpiredPrincipals()

	// Then
	assert.Equal(t, deleted, 10)
	assert.Assert(t, cmp.Len(c.principals, 0))
}

func TestCache_deleteExpiredPrincipals_noExpiredPrincipals(t *testing.T) {
	t.Parallel()
	// Given
	c, mock := newFixture()
	preloadCache(c.principals, genPrincipals(10, mock.Now().Add(time.Hour)))
	assert.Assert(t, cmp.Len(c.principals, 10))

	// When
	deleted := c.deleteExpiredPrincipals()

	// Then
	assert.Equal(t, deleted, 0o0)
	assert.Assert(t, cmp.Len(c.principals, 10))
}

func TestCache_deleteExpiredPrincipals_halfExpiredPrincipals(t *testing.T) {
	t.Parallel()
	// Given
	c, mock := newFixture()
	preloadCache(c.principals, genPrincipals(3, mock.Now()))
	preloadCache(c.principals, genPrincipals(7, mock.Now().Add(time.Hour)))
	assert.Assert(t, cmp.Len(c.principals, 10))

	// When
	mock.Add(30 * time.Minute)
	deleted := c.deleteExpiredPrincipals()

	// Then
	assert.Equal(t, deleted, 3)
	assert.Assert(t, cmp.Len(c.principals, 7))
}

func genPrincipals(amount int, expireAt time.Time) []*Principal {
	principals := make([]*Principal, 0, amount)
	for i := 0; i < amount; i++ {
		principals = append(principals, &Principal{
			Sub:       Subject(fmt.Sprintf("%d", rand.Int())), //nolint:gosec
			ExpiresAt: expireAt,
		})
	}

	return principals
}

func TestCache_expirePrincipals_cancelledContext(t *testing.T) {
	t.Parallel()

	// Given
	c, _ := newFixture()
	ctx, cancelFunc := context.WithCancel(context.Background())

	start := make(chan bool, 1)
	done := make(chan bool, 1)

	// When
	go func() {
		<-start
		c.expirePrincipals(ctx)
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
