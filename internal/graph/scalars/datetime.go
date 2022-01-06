package scalars

import (
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/99designs/gqlgen/graphql"
)

const (
	dateFormat = "2006-01-02"
	timeFormat = "15:04"
)

// MarshalLocalDate is used by the GQL runtime to marshal the LocalDate scalar.
func MarshalLocalDate(t time.Time) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, fmt.Sprintf(`"%s"`, t.Format(dateFormat)))
	})
}

// UnmarshalLocalDate is used by the GQL runtime to unmarshal LocalDate scalar input.
func UnmarshalLocalDate(v interface{}) (time.Time, error) {
	if tmpStr, ok := v.(string); ok {
		parsed, err := time.Parse(dateFormat, tmpStr)
		if err != nil {
			return time.Time{}, fmt.Errorf(
				"%s doesn't look like a LocalDate (should match %s)",
				tmpStr,
				dateFormat,
			)
		}
		return parsed, nil
	}
	return time.Time{}, errors.New("LocalDate should be a string")
}

// MarshalLocalTime is used by the GQL runtime to marshal the LocalDate scalar.
func MarshalLocalTime(t time.Time) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, fmt.Sprintf(`"%s"`, t.Format(timeFormat)))
	})
}

// UnmarshalLocalTime is used by the GQL runtime to unmarshal LocalDate scalar input.
func UnmarshalLocalTime(v interface{}) (time.Time, error) {
	if tmpStr, ok := v.(string); ok {
		parsed, err := time.Parse(timeFormat, tmpStr)
		if err != nil {
			return time.Time{}, fmt.Errorf(
				"%s doesn't look like a LocalTime (should match %s)",
				tmpStr,
				timeFormat,
			)
		}
		return parsed, nil
	}
	return time.Time{}, errors.New("LocalTime should be a string")
}
