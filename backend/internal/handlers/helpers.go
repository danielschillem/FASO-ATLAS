package handlers

import "encoding/json"

func marshalJSON(v interface{}) ([]byte, error) {
	return json.Marshal(v)
}

func paginate(page, limit int) (offset int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return (page - 1) * limit
}
