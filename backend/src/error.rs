use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("{0}")]
    BadRequest(String),
    #[error("{0}")]
    Unauthorized(String),
    #[error("{0}")]
    Forbidden(String),
    #[error("{0}")]
    NotFound(String),
    #[error("{0}")]
    Conflict(String),
    #[error(transparent)]
    Database(#[from] sqlx::Error),
    #[error(transparent)]
    Jwt(#[from] jsonwebtoken::errors::Error),
    #[error("internal server error")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::BadRequest(m) => (StatusCode::BAD_REQUEST, m.clone()),
            AppError::Unauthorized(m) => (StatusCode::UNAUTHORIZED, m.clone()),
            AppError::Forbidden(m) => (StatusCode::FORBIDDEN, m.clone()),
            AppError::NotFound(m) => (StatusCode::NOT_FOUND, m.clone()),
            AppError::Conflict(m) => (StatusCode::CONFLICT, m.clone()),
            AppError::Jwt(_) => (
                StatusCode::UNAUTHORIZED,
                "Invalid or expired token.".to_string(),
            ),
            AppError::Database(e) => {
                tracing::error!(error = %e, "database error");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "A database error occurred.".to_string(),
                )
            }
            AppError::Internal(e) => {
                tracing::error!(error = %e, "internal error");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "An internal error occurred.".to_string(),
                )
            }
        };

        (status, Json(json!({ "error": message }))).into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;
