package pagination

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func newTestContext(url string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, url, nil)
	c, _ := gin.CreateTestContext(w)
	c.Request = r
	return c, w
}

func TestParse_Defaults(t *testing.T) {
	c, _ := newTestContext("/test")
	p := Parse(c, 12)
	if p.Page != 1 {
		t.Errorf("Page = %d, want 1", p.Page)
	}
	if p.Limit != 12 {
		t.Errorf("Limit = %d, want 12", p.Limit)
	}
	if p.Offset != 0 {
		t.Errorf("Offset = %d, want 0", p.Offset)
	}
}

func TestParse_CustomValues(t *testing.T) {
	c, _ := newTestContext("/test?page=3&limit=20")
	p := Parse(c, 12)
	if p.Page != 3 {
		t.Errorf("Page = %d, want 3", p.Page)
	}
	if p.Limit != 20 {
		t.Errorf("Limit = %d, want 20", p.Limit)
	}
	if p.Offset != 40 {
		t.Errorf("Offset = %d, want 40", p.Offset)
	}
}

func TestParse_MaxLimit(t *testing.T) {
	c, _ := newTestContext("/test?limit=500")
	p := Parse(c, 12)
	if p.Limit != 100 {
		t.Errorf("Limit = %d, want 100 (max)", p.Limit)
	}
}

func TestParse_NegativeValues(t *testing.T) {
	c, _ := newTestContext("/test?page=-1&limit=-5")
	p := Parse(c, 10)
	if p.Page != 1 {
		t.Errorf("Page = %d, want 1", p.Page)
	}
	if p.Limit != 10 {
		t.Errorf("Limit = %d, want 10 (default)", p.Limit)
	}
}

func TestNewResponse(t *testing.T) {
	c, w := newTestContext("/test")
	data := []string{"a", "b"}
	p := Params{Page: 1, Limit: 10, Offset: 0}

	resp := NewResponse(c, data, 50, p)

	if resp.Total != 50 {
		t.Errorf("Total = %d, want 50", resp.Total)
	}
	if resp.Page != 1 {
		t.Errorf("Page = %d, want 1", resp.Page)
	}
	if resp.Limit != 10 {
		t.Errorf("Limit = %d, want 10", resp.Limit)
	}
	if w.Header().Get("X-Total-Count") != "50" {
		t.Errorf("X-Total-Count = %q, want 50", w.Header().Get("X-Total-Count"))
	}
}
