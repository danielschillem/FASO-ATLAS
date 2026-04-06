CREATE TABLE IF NOT EXISTS reservations (
    id                 BIGSERIAL PRIMARY KEY,
    user_id            BIGINT REFERENCES users(id) NOT NULL,
    establishment_id   BIGINT REFERENCES establishments(id) NOT NULL,
    check_in_date      DATE NOT NULL,
    check_out_date     DATE,
    guests_count       INT DEFAULT 1,
    total_price_fcfa   BIGINT,
    status             VARCHAR(20) DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','cancelled','completed')),
    special_requests   TEXT,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_user   ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_estab  ON reservations(establishment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
