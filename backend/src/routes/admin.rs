//! RBAC-protected admin management endpoints (issue #33). Every handler
//! here requires `auth.require_role(UserRole::Admin)` as its first line --
//! the same convention `require_role` already uses elsewhere (e.g.
//! `listings::create` gating on `Supplier`), rather than introducing a
//! separate middleware layer for just this module.
//!
//! `/api/admin/disputes*` and `/api/admin/audit` from the issue's spec are
//! deliberately not implemented here: neither a `disputes` nor an
//! `audit_logs` table exists yet (tracked separately as #36 and #38).
//! Building stub endpoints with no real data behind them wouldn't be
//! meaningfully "done" -- they should land alongside those features.

use axum::{Json, extract::{Path, State}};

use crate::auth::AuthUser;
use crate::error::{AppError, AppResult};
use crate::models::user::{User, UserPublic, UserRole};
use crate::state::AppState;

pub async fn list_users(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<Vec<UserPublic>>> {
    auth.require_role(UserRole::Admin)?;

    let users = sqlx::query_as!(
        User,
        r#"
        SELECT id, email, password_hash, name, role as "role: _", organization_name, phone, location, verified, profile_complete, created_at, updated_at
        FROM users ORDER BY created_at DESC
        "#,
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(users.into_iter().map(UserPublic::from).collect()))
}

pub async fn verify_user(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<String>,
) -> AppResult<Json<UserPublic>> {
    auth.require_role(UserRole::Admin)?;

    let user = sqlx::query_as!(
        User,
        r#"
        UPDATE users SET verified = TRUE, updated_at = now() WHERE id = $1
        RETURNING id, email, password_hash, name, role as "role: _", organization_name, phone, location, verified, profile_complete, created_at, updated_at
        "#,
        id,
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found.".into()))?;

    Ok(Json(UserPublic::from(user)))
}
