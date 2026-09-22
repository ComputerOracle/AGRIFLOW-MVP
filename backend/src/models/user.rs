use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum UserRole {
    Buyer,
    Supplier,
    Logistics,
    Admin,
}

impl std::fmt::Display for UserRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            UserRole::Buyer => "buyer",
            UserRole::Supplier => "supplier",
            UserRole::Logistics => "logistics",
            UserRole::Admin => "admin",
        };
        write!(f, "{s}")
    }
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub email: String,
    pub password_hash: String,
    pub name: String,
    pub role: UserRole,
    pub organization_name: Option<String>,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub verified: bool,
    pub profile_complete: bool,
    pub created_at: DateTime<Utc>,
    /// Not read yet — set by the DB `updated_at` trigger-less default;
    /// will surface once profile-update endpoints exist.
    #[allow(dead_code)]
    pub updated_at: DateTime<Utc>,
}

/// What we're willing to hand back over the API — no password hash.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPublic {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub organization_name: Option<String>,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub verified: bool,
    pub profile_complete: bool,
    pub created_at: DateTime<Utc>,
}

impl From<User> for UserPublic {
    fn from(u: User) -> Self {
        Self {
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            organization_name: u.organization_name,
            phone: u.phone,
            location: u.location,
            verified: u.verified,
            profile_complete: u.profile_complete,
            created_at: u.created_at,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: UserRole,
    pub organization_name: Option<String>,
    pub phone: Option<String>,
    pub location: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserPublic,
}
