package config

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	DatabaseURL         string
	RedisURL            string
	JWTSecret           string
	Environment         string
	AllowedOrigins      []string
	CloudinaryURL       string
	SendGridAPIKey      string
	StripeSecretKey     string
	StripeWebhookSecret string
	WebURL              string
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
		CloudinaryURL:       getEnv("CLOUDINARY_URL", ""),
		SendGridAPIKey:      getEnv("SENDGRID_API_KEY", ""),
		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
		WebURL:              getEnv("WEB_URL", "http://localhost:3000"),
	}
}

func (c *Config) ValidateForRuntime() error {
	if strings.EqualFold(c.Environment, "production") {
		if strings.TrimSpace(c.DatabaseURL) == "" {
			return fmt.Errorf("DATABASE_URL is required in production")
		}
		if strings.TrimSpace(c.RedisURL) == "" {
			return fmt.Errorf("REDIS_URL is required in production")
		}
		if strings.TrimSpace(c.WebURL) == "" {
			return fmt.Errorf("WEB_URL is required in production")
		}

		jwt := strings.TrimSpace(c.JWTSecret)
		if jwt == "" || jwt == "change-this-secret-in-production" || len(jwt) < 32 {
			return fmt.Errorf("JWT_SECRET must be set to a strong value (>= 32 chars) in production")
		}

		if strings.TrimSpace(c.StripeSecretKey) != "" && strings.TrimSpace(c.StripeWebhookSecret) == "" {
			return fmt.Errorf("STRIPE_WEBHOOK_SECRET is required when STRIPE_SECRET_KEY is set in production")
		}
	}

	return nil
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
