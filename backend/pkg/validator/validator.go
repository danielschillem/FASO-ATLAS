package validator

import (
	"regexp"
	"strings"
	"time"
	"unicode"

	"github.com/faso-atlas/backend/pkg/apperror"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// ValidateEmail checks for a valid email format.
func ValidateEmail(email string) bool {
	return emailRegex.MatchString(email)
}

// ValidatePassword enforces: min 10 chars, at least 1 uppercase, 1 digit, 1 special char.
func ValidatePassword(password string) map[string]string {
	errs := map[string]string{}
	if len(password) < 10 {
		errs["password"] = "must be at least 10 characters"
	}
	var hasUpper, hasDigit, hasSpecial bool
	for _, r := range password {
		switch {
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsDigit(r):
			hasDigit = true
		case !unicode.IsLetter(r) && !unicode.IsDigit(r):
			hasSpecial = true
		}
	}
	if !hasUpper {
		errs["password_uppercase"] = "must contain at least one uppercase letter"
	}
	if !hasDigit {
		errs["password_digit"] = "must contain at least one digit"
	}
	if !hasSpecial {
		errs["password_special"] = "must contain at least one special character"
	}
	return errs
}

// ValidateDateRange ensures from < to and both are not in the past.
func ValidateDateRange(from, to time.Time) map[string]string {
	errs := map[string]string{}
	today := time.Now().Truncate(24 * time.Hour)
	if from.Before(today) {
		errs["checkInDate"] = "must not be in the past"
	}
	if !to.IsZero() && !to.After(from) {
		errs["checkOutDate"] = "must be after check-in date"
	}
	return errs
}

// ValidateSlug ensures a slug is URL-safe.
func ValidateSlug(slug string) bool {
	if slug == "" {
		return false
	}
	matched, _ := regexp.MatchString(`^[a-z0-9]+(?:-[a-z0-9]+)*$`, slug)
	return matched
}

// SanitizeString trims whitespace and limits length.
func SanitizeString(s string, maxLen int) string {
	s = strings.TrimSpace(s)
	if len(s) > maxLen {
		return s[:maxLen]
	}
	return s
}

// Collect merges validation error maps. Returns an *AppError if any errors, nil otherwise.
func Collect(maps ...map[string]string) *apperror.AppError {
	merged := map[string]string{}
	for _, m := range maps {
		for k, v := range m {
			merged[k] = v
		}
	}
	if len(merged) == 0 {
		return nil
	}
	return apperror.Validation(merged)
}
