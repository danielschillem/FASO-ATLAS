package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type visitor struct {
	count    int
	lastSeen time.Time
}

// RateLimiter returns middleware that limits requests per IP.
// maxRequests per window duration. Uses in-memory store (suitable for single-instance).
func RateLimiter(maxRequests int, window time.Duration) gin.HandlerFunc {
	var mu sync.Mutex
	visitors := make(map[string]*visitor)

	// Background cleanup every window duration
	go func() {
		for {
			time.Sleep(window)
			mu.Lock()
			for ip, v := range visitors {
				if time.Since(v.lastSeen) > window {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		v, exists := visitors[ip]
		if !exists || time.Since(v.lastSeen) > window {
			visitors[ip] = &visitor{count: 1, lastSeen: time.Now()}
			mu.Unlock()
			c.Next()
			return
		}

		v.count++
		v.lastSeen = time.Now()

		if v.count > maxRequests {
			mu.Unlock()
			c.Header("Cache-Control", "no-store")
			c.AbortWithStatusJSON(http.StatusTooManyRequests,
				apperror.TooManyRequests("too many requests, please try again later"))
			return
		}
		mu.Unlock()
		c.Next()
	}
}

// RedisRateLimiter returns middleware that limits requests using Redis.
// Supports per-user rate limiting when the user is authenticated (UserIDKey in context).
// Falls back to IP-based limiting for unauthenticated users.
// This is suitable for multi-instance deployments.
func RedisRateLimiter(rdb *redis.Client, maxRequests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Use user ID if authenticated, otherwise IP
		key := c.ClientIP()
		if userID, exists := c.Get(UserIDKey); exists {
			key = fmt.Sprintf("user:%v", userID)
		}
		redisKey := fmt.Sprintf("ratelimit:%s", key)

		ctx := context.Background()

		// Use Redis INCR + EXPIRE for atomic rate limiting
		count, err := rdb.Incr(ctx, redisKey).Result()
		if err != nil {
			// Redis down — fall through (fail open)
			c.Next()
			return
		}

		if count == 1 {
			rdb.Expire(ctx, redisKey, window)
		}

		// Set rate limit headers
		remaining := int64(maxRequests) - count
		if remaining < 0 {
			remaining = 0
		}
		ttl, _ := rdb.TTL(ctx, redisKey).Result()
		c.Header("X-RateLimit-Limit", strconv.Itoa(maxRequests))
		c.Header("X-RateLimit-Remaining", strconv.FormatInt(remaining, 10))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(time.Now().Add(ttl).Unix(), 10))

		if count > int64(maxRequests) {
			c.Header("Cache-Control", "no-store")
			c.AbortWithStatusJSON(http.StatusTooManyRequests,
				apperror.TooManyRequests("too many requests, please try again later"))
			return
		}

		c.Next()
	}
}
