package audit

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Entry struct {
	ActorUserID *string
	Action      string
	EntityType  string
	EntityID    *string
	Before      any
	After       any
	IPAddress   string
	UserAgent   string
}

func Log(ctx context.Context, db *pgxpool.Pool, entry Entry) error {
	beforeJSON, err := nullableJSON(entry.Before)
	if err != nil {
		return fmt.Errorf("encode audit before: %w", err)
	}

	afterJSON, err := nullableJSON(entry.After)
	if err != nil {
		return fmt.Errorf("encode audit after: %w", err)
	}

	_, err = db.Exec(ctx, `
		INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent)
		VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)
	`, entry.ActorUserID, entry.Action, entry.EntityType, entry.EntityID, beforeJSON, afterJSON, entry.IPAddress, entry.UserAgent)
	if err != nil {
		return fmt.Errorf("insert audit log: %w", err)
	}

	return nil
}

func nullableJSON(value any) (*string, error) {
	if value == nil {
		return nil, nil
	}

	bytes, err := json.Marshal(value)
	if err != nil {
		return nil, err
	}

	encoded := string(bytes)
	return &encoded, nil
}
