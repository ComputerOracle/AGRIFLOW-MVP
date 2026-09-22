use axum::{Json, extract::State};

use crate::auth::{AuthUser, jwt::issue_token, password::{hash_password, verify_password}};
use crate::error::{AppError, AppResult};
use crate::ids;
use crate::models::user::{AuthResponse, LoginRequest, RegisterRequest, User, UserPublic};
use crate::state::AppState;

pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> AppResult<Json<AuthResponse>> {
    if body.name.trim().is_empty() || body.email.trim().is_empty() {
        return Err(AppError::BadRequest("Name and email are required.".into()));
    }
    if body.password.len() < 6 {
        return Err(AppError::BadRequest(
            "Password must be at least 6 characters.".into(),
        ));
    }

    let existing = sqlx::query_scalar!(
        "SELECT id FROM users WHERE lower(email) = lower($1)",
        body.email
    )
    .fetch_optional(&state.db)
    .await?;
    if existing.is_some() {
        return Err(AppError::Conflict(
            "An account with this email already exists.".into(),
        ));
    }

    let id = ids::user_id(&body.role.to_string());
    let password_hash = hash_password(&body.password)?;
    let org_name = body.organization_name.clone().or_else(|| Some(body.name.clone()));

    let user = sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (id, email, password_hash, name, role, organization_name, phone, location, verified, profile_complete)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, TRUE)
        RETURNING id, email, password_hash, name, role as "role: _", organization_name, phone, location, verified, profile_complete, created_at, updated_at
        "#,
        id,
        body.email,
        password_hash,
        body.name,
        body.role as _,
        org_name,
        body.phone,
        body.location,
    )
    .fetch_one(&state.db)
    .await?;

    let token = issue_token(
        &state.config.jwt_secret,
        state.config.jwt_expiry_hours,
        &user.id,
        user.role,
        &user.name,
        &user.email,
    )?;

    Ok(Json(AuthResponse {
        token,
        user: UserPublic::from(user),
    }))
}

pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT id, email, password_hash, name, role as "role: _", organization_name, phone, location, verified, profile_complete, created_at, updated_at
        FROM users WHERE lower(email) = lower($1)
        "#,
        body.email
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid email or password.".into()))?;

    if !verify_password(&user.password_hash, &body.password)? {
        return Err(AppError::Unauthorized("Invalid email or password.".into()));
    }

    let token = issue_token(
        &state.config.jwt_secret,
        state.config.jwt_expiry_hours,
        &user.id,
        user.role,
        &user.name,
        &user.email,
    )?;

    Ok(Json(AuthResponse {
        token,
        user: UserPublic::from(user),
    }))
}

pub async fn me(State(state): State<AppState>, auth: AuthUser) -> AppResult<Json<UserPublic>> {
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT id, email, password_hash, name, role as "role: _", organization_name, phone, location, verified, profile_complete, created_at, updated_at
        FROM users WHERE id = $1
        "#,
        auth.user_id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found.".into()))?;

    Ok(Json(UserPublic::from(user)))
}
