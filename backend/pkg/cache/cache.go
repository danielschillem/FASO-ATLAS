package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache provides a typed Redis caching layer with JSON serialization.
type Cache struct {
	rdb *redis.Client
}

// New creates a new Cache instance.
func New(rdb *redis.Client) *Cache {
	return &Cache{rdb: rdb}
}

// Get retrieves a cached value and unmarshals it into dest.
// Returns false if key doesn't exist or is expired.
func (c *Cache) Get(ctx context.Context, key string, dest interface{}) bool {
	data, err := c.rdb.Get(ctx, key).Bytes()
	if err != nil {
		return false
	}
	return json.Unmarshal(data, dest) == nil
}

// Set serializes value to JSON and stores it with the given TTL.
func (c *Cache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) {
	data, err := json.Marshal(value)
	if err != nil {
		return
	}
	c.rdb.Set(ctx, key, data, ttl)
}

// Delete removes a key from cache.
func (c *Cache) Delete(ctx context.Context, key string) {
	c.rdb.Del(ctx, key)
}

// DeletePattern removes all keys matching a glob pattern.
func (c *Cache) DeletePattern(ctx context.Context, pattern string) {
	iter := c.rdb.Scan(ctx, 0, pattern, 100).Iterator()
	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}
	if len(keys) > 0 {
		c.rdb.Del(ctx, keys...)
	}
}

// Standard TTL constants for different data types
const (
	TTLStatic   = 30 * time.Minute  // Rarely changing data (symbols, atlas events, regions)
	TTLMedium   = 5 * time.Minute   // Semi-static data (destinations, establishments, wiki)
	TTLShort    = 1 * time.Minute   // Frequently changing data (search results)
	TTLRealtime = 10 * time.Second  // Near real-time data (stats)
)
