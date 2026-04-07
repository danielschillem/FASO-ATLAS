package jwt

import (
	"testing"
	"time"
)

func TestGenerateAndValidateAccessToken(t *testing.T) {
	m := NewManager("test-secret-key")

	token, err := m.GenerateAccessToken(42, "tourist")
	if err != nil {
		t.Fatalf("GenerateAccessToken: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token")
	}

	claims, err := m.ValidateAccessToken(token)
	if err != nil {
		t.Fatalf("ValidateAccessToken: %v", err)
	}
	if claims.UserID != 42 {
		t.Errorf("UserID = %d, want 42", claims.UserID)
	}
	if claims.Role != "tourist" {
		t.Errorf("Role = %q, want tourist", claims.Role)
	}
}

func TestValidateAccessToken_InvalidToken(t *testing.T) {
	m := NewManager("test-secret-key")

	_, err := m.ValidateAccessToken("invalid.token.here")
	if err == nil {
		t.Fatal("expected error for invalid token")
	}
}

func TestValidateAccessToken_WrongSecret(t *testing.T) {
	m1 := NewManager("secret-one")
	m2 := NewManager("secret-two")

	token, _ := m1.GenerateAccessToken(1, "admin")
	_, err := m2.ValidateAccessToken(token)
	if err == nil {
		t.Fatal("expected error when validating with wrong secret")
	}
}

func TestValidateAccessToken_Expired(t *testing.T) {
	m := &Manager{
		secret:          "test-secret",
		accessTokenTTL:  -1 * time.Second, // already expired
		refreshTokenTTL: 30 * 24 * time.Hour,
	}

	token, err := m.GenerateAccessToken(1, "tourist")
	if err != nil {
		t.Fatalf("GenerateAccessToken: %v", err)
	}

	_, err = m.ValidateAccessToken(token)
	if err == nil {
		t.Fatal("expected error for expired token")
	}
}

func TestRefreshTokenTTL(t *testing.T) {
	m := NewManager("secret")
	if m.RefreshTokenTTL() != 30*24*time.Hour {
		t.Errorf("RefreshTokenTTL = %v, want 30 days", m.RefreshTokenTTL())
	}
}

func TestGenerateAccessToken_DifferentRoles(t *testing.T) {
	m := NewManager("secret")

	roles := []string{"tourist", "owner", "admin"}
	for _, role := range roles {
		token, err := m.GenerateAccessToken(1, role)
		if err != nil {
			t.Fatalf("GenerateAccessToken(role=%s): %v", role, err)
		}
		claims, err := m.ValidateAccessToken(token)
		if err != nil {
			t.Fatalf("ValidateAccessToken(role=%s): %v", role, err)
		}
		if claims.Role != role {
			t.Errorf("Role = %q, want %q", claims.Role, role)
		}
	}
}
