package serverenv

// RedisConfig describes the information needed to connect to a redis instance.
type RedisConfig struct {
	Host     string `env:"REDIS_HOST, default=127.0.0.1"`
	Port     string `env:"REDIS_PORT, default=6379"`
	Password string `env:"REDIS_PASSWORD" json:"-"`
}

type RedisConfigProvider interface {
	RedisConfig() RedisConfig
}
