package swish

import (
	"encoding/json"
	"fmt"
	"net/url"
)

// as per Swish requirements.
const (
	messageMaxLen = 50
	amountMax     = 150_000
	amountMin     = 1
)

type StringVal struct {
	Value    string `json:"value"`
	Editable bool   `json:"editable"`
}

type IntVal struct {
	Value    int  `json:"value"`
	Editable bool `json:"editable"`
}

type Data struct {
	Version int       `json:"version"` // default 1
	Payee   StringVal `json:"payee"`
	Amount  IntVal    `json:"amount"`
	Message StringVal `json:"message"`
}

func FormatURI(payee string, amount int, message string) (string, error) {
	if len(message) > messageMaxLen {
		return "", fmt.Errorf("message too long. got %d expected %d", len(message), messageMaxLen)
	}
	if amount > amountMax {
		return "", fmt.Errorf("too large amount, got %d, expected <= %d", amount, amountMax)
	}
	if amount < amountMin {
		return "", fmt.Errorf("amount may not be less than %d, got %d", amountMin, amount)
	}

	return Data{
		Version: 1,
		Payee:   StringVal{Value: payee},
		Amount:  IntVal{Value: amount},
		Message: StringVal{Value: message},
	}.URI()
}

func (data Data) URI() (string, error) {
	const start = "swish://payment?data="
	marshal, err := json.Marshal(data)
	if err != nil {
		return start, fmt.Errorf("failed to marshal Swish data: %w", err)
	}
	return fmt.Sprintf("%s%s", start, url.PathEscape(string(marshal))), nil
}
