use std::net::SocketAddr;

#[derive(Clone)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_expiry_hours: i64,
    pub server_addr: SocketAddr,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let database_url = std::env::var("DATABASE_URL")
            .map_err(|_| anyhow::anyhow!("DATABASE_URL is not set"))?;
        let jwt_secret =
            std::env::var("JWT_SECRET").map_err(|_| anyhow::anyhow!("JWT_SECRET is not set"))?;
        let jwt_expiry_hours = std::env::var("JWT_EXPIRY_HOURS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(24);
        // Railway (and most PaaS platforms) inject $PORT and expect the app
        // to bind to it; SERVER_ADDR remains the override for local/manual runs.
        let server_addr: SocketAddr = match std::env::var("PORT") {
            Ok(port) => format!("0.0.0.0:{port}").parse()?,
            Err(_) => std::env::var("SERVER_ADDR")
                .unwrap_or_else(|_| "0.0.0.0:8080".to_string())
                .parse()?,
        };

        Ok(Self {
            database_url,
            jwt_secret,
            jwt_expiry_hours,
            server_addr,
        })
    }
}
