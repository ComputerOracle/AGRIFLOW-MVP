use argon2::{
    Argon2,
    password_hash::{PasswordHasher, PasswordVerifier, phc::PasswordHash},
};

use crate::error::{AppError, AppResult};

pub fn hash_password(plain: &str) -> AppResult<String> {
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(plain.as_bytes())
        .map_err(|e| AppError::Internal(anyhow::anyhow!("password hashing failed: {e}")))?;
    Ok(hash.to_string())
}

pub fn verify_password(hash: &str, plain: &str) -> AppResult<bool> {
    let parsed = PasswordHash::new(hash)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("stored password hash is invalid: {e}")))?;
    Ok(Argon2::default()
        .verify_password(plain.as_bytes(), &parsed)
        .is_ok())
}
