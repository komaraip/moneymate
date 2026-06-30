package response

import (
	"encoding/json"
	"errors"
	"net/http"

	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"moneymate/backend/internal/apperror"
)

type Envelope struct {
	Success   bool       `json:"success"`
	Data      any        `json:"data,omitempty"`
	Meta      any        `json:"meta,omitempty"`
	Error     *ErrorBody `json:"error,omitempty"`
	RequestID string     `json:"request_id"`
}

type ErrorBody struct {
	Code    apperror.Code `json:"code"`
	Message string        `json:"message"`
	Details []string      `json:"details,omitempty"`
}

func JSON(w http.ResponseWriter, r *http.Request, status int, data any, meta any) {
	write(w, status, Envelope{
		Success:   true,
		Data:      data,
		Meta:      meta,
		RequestID: requestID(r),
	})
}

func Error(w http.ResponseWriter, r *http.Request, err error) {
	appErr, ok := apperror.As(err)
	if !ok {
		appErr = apperror.Wrap(
			err,
			apperror.CodeInternal,
			"Terjadi kesalahan pada server",
			http.StatusInternalServerError,
		)
	}

	if appErr.StatusCode == 0 {
		appErr.StatusCode = http.StatusInternalServerError
	}

	write(w, appErr.StatusCode, Envelope{
		Success: false,
		Error: &ErrorBody{
			Code:    appErr.Code,
			Message: appErr.Message,
			Details: appErr.Details,
		},
		RequestID: requestID(r),
	})
}

func DecodeJSON(r *http.Request, dst any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(dst); err != nil {
		return apperror.Wrap(
			err,
			apperror.CodeValidation,
			"Input tidak valid",
			http.StatusBadRequest,
		)
	}

	return nil
}

func write(w http.ResponseWriter, status int, payload Envelope) {
	w.Header().Set("Content-Type", "application/json")
	if payload.RequestID != "" {
		w.Header().Set("X-Request-ID", payload.RequestID)
	}

	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil && !errors.Is(err, http.ErrHandlerTimeout) {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func requestID(r *http.Request) string {
	return chimiddleware.GetReqID(r.Context())
}
