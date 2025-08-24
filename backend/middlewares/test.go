package middlewares

import (
	"net/http"
)

func TestMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Do something before the request is handled
		next.ServeHTTP(w, r)
		// Do something after the request is handled
	})
}