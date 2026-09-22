# agriflow-api

Rust backend for AgriFlow. Replaces `localStorage` as the source of truth for
users, supply listings, demand requests, and transactions — ported 1:1 from
the business logic in the React app's `src/services/*`, so the frontend can
be repointed from `localStorage` to HTTP calls without behavior changes.

This slice covers **auth, users, listings, demands, and the transaction state
machine**. Escrow/payments, logistics jobs, disputes, notifications, and the
audit log are not built yet — see "Not built yet" below.

## Stack

- **Axum** (web framework) + **Tokio** (async runtime)
- **Postgres** via **sqlx** (compile-time checked queries)
- **JWT** auth (`jsonwebtoken`) + **Argon2** password hashing
- **rust_decimal** for money/quantity fields (no float rounding on prices)

## Running it

```bash
# 1. Start Postgres
docker-compose up -d

# 2. Copy env and adjust if needed (defaults match docker-compose.yml)
cp .env.example .env

# 3. Apply migrations
cargo run --bin migrate

# 4. Run the API
cargo run --bin agriflow-api
# -> listening on 0.0.0.0:8080
```

Run tests (currently the transaction state machine's parity tests):

```bash
cargo test
```

## Architecture notes

- `src/state_machine.rs` is a **1:1 port** of
  `src/services/transactionStateMachine.ts` from the React app — same
  transition table, same actor-role gating, same idempotent-reaccept special
  case. This is now the authoritative copy; the TS file becomes display-only
  once the frontend is repointed at this API. If the transition rules ever
  need to change, change them here first and mirror back to the TS file
  (or delete it once the frontend no longer needs its own copy).
- Every DB-row struct doubles as the API response shape via `#[serde(rename_all
  = "camelCase")]`, matching the field names already used by
  `src/types/index.ts` in the frontend (e.g. `pricePerUnit`, not
  `price_per_unit`) — the goal is a drop-in swap for the frontend's
  `services/*.ts` fetch calls with no reshaping logic needed.
- IDs are generated in the same human-readable shape the frontend/demo data
  already uses (`USR-BUY-12345`, `TXN-AGF-87726`, ...) rather than switching
  to UUIDs, so existing fixtures/screenshots/docs referencing these IDs stay
  legible.
- Auth is stateless JWT (`Authorization: Bearer <token>`), decoded per
  request via the `AuthUser` extractor — no session table. Role checks
  (`AuthUser::require_role`) mirror the frontend's `UserRole` gating.

## API surface

All routes are under `/api`.

| Method | Path                          | Auth           | Notes |
|--------|-------------------------------|----------------|-------|
| POST   | `/auth/register`              | —              | Any role |
| POST   | `/auth/login`                 | —              | |
| GET    | `/auth/me`                    | any            | |
| GET    | `/listings`                   | —              | `?commodity=&status=` (default `status=active`) |
| GET    | `/listings/mine`               | supplier        | |
| POST   | `/listings`                    | supplier        | |
| GET    | `/listings/:id`                | —               | |
| PATCH  | `/listings/:id`                 | supplier (owner) | |
| GET    | `/demands`                       | —                | `?commodity=&status=` (default `status=open`) |
| GET    | `/demands/mine`                  | buyer             | |
| POST   | `/demands`                        | buyer             | |
| GET    | `/demands/:id`                     | —                  | |
| POST   | `/transactions`                    | buyer              | Creates from a listing; validates stock |
| GET    | `/transactions`                     | any                 | Role-scoped: buyer/supplier see their own, admin sees all |
| GET    | `/transactions/:id`                  | participant or admin | Includes full event history |
| POST   | `/transactions/:id/transition`        | participant (role-gated by state machine) | `{ "to": "ACCEPTED", "note": "..." }` |

## Not built yet (next slices)

- **Escrow/payments** — this is the big one. Plan is an `EscrowProvider`
  trait with a `MockEscrow` implementation first (so payment endpoints work
  end-to-end today), swapped for a real on-chain (USDC) implementation once
  a contract exists.
- **Logistics jobs** — provider assignment, milestone updates, proof of
  delivery. The state machine already supports these statuses
  (`LOGISTICS_ASSIGNED`, `IN_TRANSIT`, etc.); only the `logistics_jobs`
  table and endpoints are missing.
- **Disputes, notifications, audit log** — same story: state machine and
  data model are ready to extend, tables/endpoints aren't built.
- **Matching engine** — the weighted scoring algorithm from
  `matchingService.ts` hasn't been ported.

## Environment variables

See `.env.example`. `JWT_SECRET` must be changed before any real deployment
— the example value is a placeholder.
