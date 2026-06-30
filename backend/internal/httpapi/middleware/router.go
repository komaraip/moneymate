package middleware

import "github.com/go-chi/chi/v5"

func NewChiRouter() *chi.Mux {
	return chi.NewRouter()
}
