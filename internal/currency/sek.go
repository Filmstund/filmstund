package currency

import (
	"fmt"
	"io"
	"strconv"
	"strings"
)

type SEK int32 // in ören

const (
	Oren   SEK = 1
	Kronor SEK = 100 // 100 ören == 1 kr
)

func (sek SEK) String() string {
	f := float64(sek) / float64(Kronor)
	return strconv.FormatFloat(f, 'f', -1, 64) + " kr"
}

func (sek *SEK) UnmarshalGQL(v interface{}) error {
	if str, ok := v.(string); ok {
		n := strings.SplitN(str, " ", 2)

		kronorOren := strings.SplitN(n[0], ".", 2)
		var (
			rawKronor int
			rawOren   int
		)
		rawKronor, err := strconv.Atoi(kronorOren[0])
		if err != nil {
			return fmt.Errorf("failed to parse SEK (Kronor): %w", err)
		}
		if len(kronorOren) > 1 {
			rawOren, err = strconv.Atoi(kronorOren[1])
			if err != nil {
				return fmt.Errorf("failed to parse SEK (Ören): %w", err)
			}
		}

		*sek = SEK(rawKronor)*Kronor + SEK(rawOren)*Oren
		return nil
	}
	return fmt.Errorf("SEK must be a string, got %T", v)
}

func (sek SEK) MarshalGQL(w io.Writer) {
	output := fmt.Sprintf(`"%s"`, sek.String())
	if _, err := w.Write([]byte(output)); err != nil {
		return
	}
}
