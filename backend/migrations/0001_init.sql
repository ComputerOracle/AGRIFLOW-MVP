-- Mirrors src/types/index.ts. Enums are kept as TEXT + CHECK so new variants
-- from the frontend's TS union types can be added without an ALTER TYPE dance.

CREATE TABLE users (
    id                  TEXT PRIMARY KEY,
    email               TEXT NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    name                TEXT NOT NULL,
    role                TEXT NOT NULL CHECK (role IN ('buyer', 'supplier', 'logistics', 'admin')),
    organization_name   TEXT,
    phone               TEXT,
    location            TEXT,
    verified            BOOLEAN NOT NULL DEFAULT TRUE,
    profile_complete    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE supply_listings (
    id                  TEXT PRIMARY KEY,
    supplier_id         TEXT NOT NULL REFERENCES users(id),
    supplier_name       TEXT NOT NULL,
    supplier_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    commodity           TEXT NOT NULL,
    quantity            NUMERIC NOT NULL CHECK (quantity > 0),
    unit                TEXT NOT NULL,
    quality_grade       TEXT NOT NULL,
    price_per_unit      NUMERIC NOT NULL CHECK (price_per_unit >= 0),
    currency            TEXT NOT NULL DEFAULT 'NGN',
    location             TEXT NOT NULL,
    availability_date   TIMESTAMPTZ NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    status              TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'inactive', 'sold', 'pending_review')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_supplier ON supply_listings(supplier_id);
CREATE INDEX idx_listings_status ON supply_listings(status);
CREATE INDEX idx_listings_commodity ON supply_listings(commodity);

CREATE TABLE demand_requests (
    id                      TEXT PRIMARY KEY,
    buyer_id                TEXT NOT NULL REFERENCES users(id),
    buyer_name               TEXT NOT NULL,
    commodity                TEXT NOT NULL,
    quantity                 NUMERIC NOT NULL CHECK (quantity > 0),
    unit                     TEXT NOT NULL,
    quality_grade             TEXT NOT NULL,
    destination_location      TEXT NOT NULL,
    required_by_date          TIMESTAMPTZ NOT NULL,
    indicative_budget         NUMERIC NOT NULL DEFAULT 0,
    currency                  TEXT NOT NULL DEFAULT 'NGN',
    notes                     TEXT,
    status                    TEXT NOT NULL DEFAULT 'open'
                                CHECK (status IN ('open', 'matched', 'fulfilled', 'closed')),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_demands_buyer ON demand_requests(buyer_id);
CREATE INDEX idx_demands_status ON demand_requests(status);
CREATE INDEX idx_demands_commodity ON demand_requests(commodity);

CREATE TABLE transactions (
    id                      TEXT PRIMARY KEY,
    listing_id              TEXT NOT NULL REFERENCES supply_listings(id),
    demand_id               TEXT REFERENCES demand_requests(id),
    buyer_id                TEXT NOT NULL REFERENCES users(id),
    buyer_name               TEXT NOT NULL,
    supplier_id              TEXT NOT NULL REFERENCES users(id),
    supplier_name             TEXT NOT NULL,
    commodity                 TEXT NOT NULL,
    quantity                  NUMERIC NOT NULL CHECK (quantity > 0),
    unit                      TEXT NOT NULL,
    quality_grade              TEXT NOT NULL,
    price_per_unit              NUMERIC NOT NULL CHECK (price_per_unit >= 0),
    total_amount                NUMERIC NOT NULL CHECK (total_amount >= 0),
    currency                    TEXT NOT NULL DEFAULT 'NGN',
    pickup_location              TEXT NOT NULL,
    delivery_location             TEXT NOT NULL,
    expected_delivery_date        TIMESTAMPTZ NOT NULL,
    status                        TEXT NOT NULL DEFAULT 'PENDING',
    payment_id                    TEXT,
    logistics_job_id              TEXT,
    dispute_id                    TEXT,
    created_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_supplier ON transactions(supplier_id);
CREATE INDEX idx_transactions_status ON transactions(status);

CREATE TABLE transaction_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    status          TEXT NOT NULL,
    actor            TEXT NOT NULL,
    actor_role       TEXT NOT NULL,
    note             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_txn_events_txn ON transaction_events(transaction_id);
