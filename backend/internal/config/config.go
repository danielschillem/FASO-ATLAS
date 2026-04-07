package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	RedisURL       string
	JWTSecret      string
	Environment    string
	AllowedOrigins []string
	CloudinaryURL  string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/faso_atlas?sslmode=disable"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:   getEnv("JWT_SECRET", "change-this-secret-in-production"),
		Environment: getEnv("ENVIRONMENT", "development"),
		AllowedOrigins: []string{
			getEnv("WEB_URL", "http://localhost:3000"),
			getEnv("MOBILE_URL", ""),
		},
		CloudinaryURL: getEnv("CLOUDINARY_URL", ""),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
