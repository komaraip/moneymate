package apperror

import "errors"

type Code string

const (
	CodeInternal     Code = "INTERNAL_ERROR"
	CodeValidation   Code = "VALIDATION_ERROR"
	CodeUnauthorized Code = "UNAUTHORIZED"
	CodeForbidden    Code = "FORBIDDEN"
	CodeNotFound     Code = "NOT_FOUND"
	CodeConflict     Code = "CONFLICT"
)

type AppError struct {
	Code       Code
	Message    string
	Details    []string
	StatusCode int
	Err        error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}

	return e.Message
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func New(code Code, message string, statusCode int) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		StatusCode: statusCode,
	}
}

func Wrap(err error, code Code, message string, statusCode int) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		StatusCode: statusCode,
		Err:        err,
	}
}

func WithDetails(err *AppError, details []string) *AppError {
	err.Details = details
	return err
}

func As(err error) (*AppError, bool) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr, true
	}

	return nil, false
}
