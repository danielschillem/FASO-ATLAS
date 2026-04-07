package apperror

import (
	"net/http"
	"testing"
)

func TestBadRequest(t *testing.T) {
	err := BadRequest("invalid input")
	if err.HTTPStatus != http.StatusBadRequest {
		t.Errorf("HTTPStatus = %d, want %d", err.HTTPStatus, http.StatusBadRequest)
	}
	if err.ErrCode != CodeBadRequest {
		t.Errorf("Code = %s, want %s", err.ErrCode, CodeBadRequest)
	}
	if err.Message != "invalid input" {
		t.Errorf("Message = %q, want %q", err.Message, "invalid input")
	}
}

func TestUnauthorized(t *testing.T) {
	err := Unauthorized("not logged in")
	if err.HTTPStatus != http.StatusUnauthorized {
		t.Errorf("HTTPStatus = %d, want %d", err.HTTPStatus, http.StatusUnauthorized)
	}
	if err.ErrCode != CodeUnauthorized {
		t.Errorf("Code = %s, want %s", err.ErrCode, CodeUnauthorized)
	}
}

func TestForbidden(t *testing.T) {
	err := Forbidden("access denied")
	if err.HTTPStatus != http.StatusForbidden {
		t.Errorf("HTTPStatus = %d, want %d", err.HTTPStatus, http.StatusForbidden)
	}
}

func TestNotFound(t *testing.T) {
	err := NotFound("destination")
	if err.HTTPStatus != http.StatusNotFound {
		t.Errorf("HTTPStatus = %d, want %d", err.HTTPStatus, http.StatusNotFound)
	}
	if err.Message != "destination not found" {
		t.Errorf("Message = %q, want %q", err.Message, "destination not found")
	}
}

func TestConflict(t *testing.T) {
	err := Conflict("email already in use")
	if err.HTTPStatus != http.StatusConflict {
		t.Errorf("HTTPStatus = %d, want %d", err.HTTPStatus, http.StatusConflict)
	}
}

func TestValidation(t *testing.T) {
	details := map[string]string{"email": "required"}
	err := Validation(details)
	if err.HTTPStatus != http.StatusUnprocessableEntity {
		t.Errorf("HTTPStatus = %d, want %d", err.HTTPStatus, http.StatusUnprocessableEntity)
	}
	if err.Details["email"] != "required" {
		t.Errorf("Details[email] = %q, want %q", err.Details["email"], "required")
	}
}

func TestInternal(t *testing.T) {
	err := Internal("server error")
	if err.HTTPStatus != http.StatusInternalServerError {
		t.Errorf("HTTPStatus = %d, want %d", err.HTTPStatus, http.StatusInternalServerError)
	}
}

func TestTooManyRequests(t *testing.T) {
	err := TooManyRequests("slow down")
	if err.HTTPStatus != http.StatusTooManyRequests {
		t.Errorf("HTTPStatus = %d, want %d", err.HTTPStatus, http.StatusTooManyRequests)
	}
}

func TestErrorInterface(t *testing.T) {
	err := BadRequest("test")
	msg := err.Error()
	if msg != "[BAD_REQUEST] test" {
		t.Errorf("Error() = %q, want %q", msg, "[BAD_REQUEST] test")
	}
}
