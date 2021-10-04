package security

func NewService(cfg *Config) *Service {
	return &Service{
		cfg: cfg,
	}
}

type Service struct {
	cfg *Config
}
