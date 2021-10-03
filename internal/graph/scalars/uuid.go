package scalars

import (
	"fmt"
	"io"

	"github.com/99designs/gqlgen/graphql"
	"github.com/google/uuid"
)

func MarshalUUIDScalar(b uuid.UUID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		asStr := fmt.Sprintf(`"%s"`, b.String())
		if _, err := w.Write([]byte(asStr)); err != nil {
			return
		}
	})
}

func UnmarshalUUIDScalar(v interface{}) (uuid.UUID, error) {
	switch v := v.(type) {
	case *string:
		if v == nil {
			return uuid.Nil, fmt.Errorf("missing UUID")
		}
		parsed, err := uuid.Parse(*v)
		if err != nil {
			return uuid.Nil, fmt.Errorf("invalid UUID: %w", err)
		}

		return parsed, nil
	case string:
		parsed, err := uuid.Parse(v)
		if err != nil {
			return uuid.Nil, fmt.Errorf("invalid UUID: %w", err)
		}
		return parsed, nil
	default:
		return uuid.Nil, fmt.Errorf("%T is not a string", v)
	}
}
