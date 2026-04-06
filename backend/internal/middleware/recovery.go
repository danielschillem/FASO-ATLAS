package middleware

import (
	"log"
	"net/http"

	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const RequestIDKey = "requestID"

// RequestID injects a unique request ID into every request context and response header.
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := uuid.New().String()
		c.Set(RequestIDKey, id)
		c.Header("X-Request-ID", id)
		c.Next()
	}
}

// ErrorHandler catches *apperror.AppError set via c.Error() and renders a structured JSON response.
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) == 0 {
			return
		}

		lastErr := c.Errors.Last().Err
		if appErr, ok := lastErr.(*apperror.AppError); ok {
			c.JSON(appErr.HTTPStatus, appErr)
			return
		}

		// Fallback: don't leak internal error details
		reqID, _ := c.Get(RequestIDKey)
		log.Printf("[ERROR] request_id=%v err=%v", reqID, lastErr)
		c.JSON(http.StatusInternalServerError, apperror.Internal("an unexpected error occurred"))
	}
}

// Recovery recovers from panics and returns a 500 JSON response.
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				reqID, _ := c.Get(RequestIDKey)
				log.Printf("[PANIC] request_id=%v recover=%v", reqID, r)
				c.AbortWithStatusJSON(http.StatusInternalServerError,
					apperror.Internal("an unexpected error occurred"))
			}
		}()
		c.Next()
	}
}
