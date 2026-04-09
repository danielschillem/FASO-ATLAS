-- +migrate Up
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255) DEFAULT '';
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'none';
CREATE INDEX IF NOT EXISTS idx_reservations_payment_intent ON reservations (payment_intent_id) WHERE payment_intent_id != '';

-- +migrate Down
DROP INDEX IF EXISTS idx_reservations_payment_intent;
ALTER TABLE reservations DROP COLUMN IF EXISTS payment_status;
ALTER TABLE reservations DROP COLUMN IF EXISTS payment_intent_id;
