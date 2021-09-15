package logging

import (
	"log"

	"go.uber.org/zap"
)

func NewLogger() *zap.SugaredLogger {
	logger, err := zap.NewDevelopment()
	if err != nil {
		log.Printf("unable to create new logger: %v", err)
		logger = zap.NewNop()
	}
	return logger.Sugar()
}
