-- Régie publicitaire interne : espaces pub partenaires
CREATE TABLE IF NOT EXISTS ads (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(120) NOT NULL,
    partner_name VARCHAR(120) NOT NULL,
    placement    VARCHAR(30)  NOT NULL CHECK (placement IN ('banner','card','sidebar')),
    image_url    TEXT         NOT NULL,
    link_url     TEXT         NOT NULL,
    alt_text     VARCHAR(255) NOT NULL DEFAULT '',
    pages        TEXT[]       NOT NULL DEFAULT '{}',
    priority     INT          NOT NULL DEFAULT 0,
    impressions  BIGINT       NOT NULL DEFAULT 0,
    clicks       BIGINT       NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    starts_at    TIMESTAMPTZ,
    ends_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ads_placement ON ads(placement) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ads_active    ON ads(is_active, placement) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ads_dates     ON ads(starts_at, ends_at) WHERE deleted_at IS NULL;
