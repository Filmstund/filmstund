package httputils

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"edholm.dev/go-logging"
)

var (
	ErrBadRequest   = errors.New("bad request")
	ErrUnauthorized = errors.New("unauthorized")
	ErrForbidden    = errors.New("forbidden")
	ErrInternal     = errors.New("internal server error")
)

type ErrorResponse struct {
	Error   string    `json:"error"`
	Details string    `json:"details,omitempty"`
	Time    time.Time `json:"time,omitempty"`
}

func RespondBasedOnErr(err error, w http.ResponseWriter, r *http.Request) {
	if err == nil {
		InternalServerError(w, r)
	}

	if errors.Is(err, ErrBadRequest) {
		BadRequest(w, r, err.Error())
	} else if errors.Is(err, ErrUnauthorized) {
		Unauthorized(w, r)
	} else if errors.Is(err, ErrForbidden) {
		Forbidden(w, r)
	} else {
		InternalServerError(w, r)
	}
}

func BadRequest(w http.ResponseWriter, r *http.Request, trailer string) {
	errMsg := "bad request"
	if trailer != "" {
		errMsg = errMsg + ": " + trailer
	}
	if strings.HasPrefix(trailer, ErrBadRequest.Error()) {
		errMsg = trailer
	}

	sendError(
		w,
		r,
		http.StatusBadRequest,
		ErrorResponse{
			Error: errMsg,
			Time:  time.Now(),
		},
	)
}

func InternalServerError(w http.ResponseWriter, r *http.Request) {
	sendError(
		w,
		r,
		http.StatusInternalServerError,
		ErrorResponse{
			Error: "an unexpected error occurred",
			Time:  time.Now(),
		},
	)
}

func Forbidden(w http.ResponseWriter, r *http.Request) {
	sendError(
		w,
		r,
		http.StatusForbidden,
		ErrorResponse{
			Error: "forbidden",
			Time:  time.Now(),
		},
	)
}

func Unauthorized(w http.ResponseWriter, r *http.Request) {
	sendError(
		w,
		r,
		http.StatusUnauthorized,
		ErrorResponse{
			Error: "unauthorized",
			Time:  time.Now(),
		},
	)
}

func sendError(w http.ResponseWriter, r *http.Request, status int, response ErrorResponse) {
	logger := logging.FromContext(r.Context())

	w.WriteHeader(status)
	w.Header().Set("Content-Type", "application/json")

	bytes, err := json.Marshal(response)
	if err != nil {
		logger.Warnw("failed to unmarshal error response", "err", err)
		return
	}

	if _, err = w.Write(bytes); err != nil {
		logger.Warnw("failed to write error response", "err", err)
		return
	}
}

// TODO test.
func ExtractTokenFromHeader(r *http.Request) (string, bool) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return "", false
	}

	return strings.TrimPrefix(authHeader, "Bearer "), true
}
