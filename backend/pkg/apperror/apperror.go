package apperror

import (
	"fmt"
	"net/http"
)

// Code represents a machine-readable error code.
type Code string

const (
	CodeBadRequest     Code = "BAD_REQUEST"
	CodeUnauthorized   Code = "UNAUTHORIZED"
	CodeForbidden      Code = "FORBIDDEN"
	CodeNotFound       Code = "NOT_FOUND"
	CodeConflict       Code = "CONFLICT"
	CodeValidation     Code = "VALIDATION_ERROR"
	CodeInternal       Code = "INTERNAL_ERROR"
	CodeTooManyRequest Code = "TOO_MANY_REQUESTS"
)

// AppError is a structured application error that can be returned as JSON.
type AppError struct {
	HTTPStatus int               `json:"-"`
	ErrCode    Code              `json:"code"`
	Message    string            `json:"message"`
	Details    map[string]string `json:"details,omitempty"`
}

func (e *AppError) Error() string {
	return fmt.Sprintf("[%s] %s", e.ErrCode, e.Message)
}

func BadRequest(msg string) *AppError {
	return &AppError{HTTPStatus: http.StatusBadRequest, ErrCode: CodeBadRequest, Message: msg}
}

func Unauthorized(msg string) *AppError {
	return &AppError{HTTPStatus: http.StatusUnauthorized, ErrCode: CodeUnauthorized, Message: msg}
}

func Forbidden(msg string) *AppError {
	return &AppError{HTTPStatus: http.StatusForbidden, ErrCode: CodeForbidden, Message: msg}
}

func NotFound(resource string) *AppError {
	return &AppError{HTTPStatus: http.StatusNotFound, ErrCode: CodeNotFound, Message: resource + " not found"}
}

func Conflict(msg string) *AppError {
	return &AppError{HTTPStatus: http.StatusConflict, ErrCode: CodeConflict, Message: msg}
}

func Validation(details map[string]string) *AppError {
	return &AppError{
		HTTPStatus: http.StatusUnprocessableEntity,
		ErrCode:    CodeValidation,
		Message:    "validation failed",
		Details:    details,
	}
}

func Internal(msg string) *AppError {
	return &AppError{HTTPStatus: http.StatusInternalServerError, ErrCode: CodeInternal, Message: msg}
}

func TooManyRequests(msg string) *AppError {
	return &AppError{HTTPStatus: http.StatusTooManyRequests, ErrCode: CodeTooManyRequest, Message: msg}
}
