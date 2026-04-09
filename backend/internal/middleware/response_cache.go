package middleware

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/faso-atlas/backend/pkg/cache"
	"github.com/gin-gonic/gin"
)

type cachedResponse struct {
	Status  int               `json:"s"`
	Body    []byte            `json:"b"`
	Headers map[string]string `json:"h"`
	ETag    string            `json:"e"`
}

type cacheWriter struct {
	gin.ResponseWriter
	body   *bytes.Buffer
	status int
}

func (w *cacheWriter) Write(data []byte) (int, error) {
	w.body.Write(data)
	return w.ResponseWriter.Write(data)
}

func (w *cacheWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

// ResponseCache caches successful GET responses in Redis.
// Only caches 200 OK responses. Cache key is derived from the full URL + query string.
func ResponseCache(c *cache.Cache, prefix string, ttl time.Duration) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if ctx.Request.Method != http.MethodGet {
			ctx.Next()
			return
		}

		// Build cache key from URL path + query string
		h := sha256.Sum256([]byte(ctx.Request.URL.RequestURI()))
		key := prefix + ":" + hex.EncodeToString(h[:8])

		// Try cache hit
		var cached cachedResponse
		if c.Get(ctx.Request.Context(), key, &cached) {
			// ETag conditional request — return 304 if unchanged
			if cached.ETag != "" && ctx.GetHeader("If-None-Match") == cached.ETag {
				ctx.Header("ETag", cached.ETag)
				ctx.Header("X-Cache", "HIT")
				ctx.Status(http.StatusNotModified)
				ctx.Abort()
				return
			}
			for k, v := range cached.Headers {
				ctx.Header(k, v)
			}
			ctx.Header("X-Cache", "HIT")
			if cached.ETag != "" {
				ctx.Header("ETag", cached.ETag)
			}
			ctx.Data(cached.Status, "application/json; charset=utf-8", cached.Body)
			ctx.Abort()
			return
		}

		// Cache miss - capture the response
		w := &cacheWriter{ResponseWriter: ctx.Writer, body: &bytes.Buffer{}, status: 200}
		ctx.Writer = w

		ctx.Next()

		// Only cache successful responses
		if w.status == http.StatusOK && w.body.Len() > 0 && w.body.Len() < 512*1024 {
			bodyHash := sha256.Sum256(w.body.Bytes())
			etag := `"` + hex.EncodeToString(bodyHash[:8]) + `"`
			headers := map[string]string{
					"Content-Type":  w.Header().Get("Content-Type"),
					"X-Total-Count": w.Header().Get("X-Total-Count"),
				}
				// Preserve CORS headers so cached responses still pass browser checks
				for _, ch := range []string{"Access-Control-Allow-Origin", "Access-Control-Allow-Credentials", "Vary"} {
					if v := w.Header().Get(ch); v != "" {
						headers[ch] = v
					}
				}
				resp := cachedResponse{
					Status:  w.status,
					Body:    w.body.Bytes(),
					ETag:    etag,
					Headers: headers,
				}
			c.Set(ctx.Request.Context(), key, resp, ttl)
			ctx.Header("ETag", etag)
		}
		ctx.Header("X-Cache", "MISS")
	}
}
