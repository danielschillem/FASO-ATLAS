package pagination

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// Params holds parsed pagination parameters.
type Params struct {
	Page   int
	Limit  int
	Offset int
}

// Parse extracts page/limit from query string with safe defaults and bounds.
func Parse(c *gin.Context, defaultLimit int) Params {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(defaultLimit)))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = defaultLimit
	}
	if limit > 100 {
		limit = 100
	}

	return Params{
		Page:   page,
		Limit:  limit,
		Offset: (page - 1) * limit,
	}
}

// Response is the standard paginated response envelope.
type Response struct {
	Data  interface{} `json:"data"`
	Total int64       `json:"total"`
	Page  int         `json:"page"`
	Limit int         `json:"limit"`
}

// NewResponse builds a paginated response and sets the X-Total-Count header.
func NewResponse(c *gin.Context, data interface{}, total int64, p Params) Response {
	c.Header("X-Total-Count", strconv.FormatInt(total, 10))
	return Response{
		Data:  data,
		Total: total,
		Page:  p.Page,
		Limit: p.Limit,
	}
}
