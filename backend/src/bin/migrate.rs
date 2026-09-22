//! Standalone migration runner: `cargo run --bin migrate`.
//! Kept separate from the API binary so schema can be applied (e.g. in CI or
//! before `cargo check`) without booting the whole server.

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    let database_url = std::env::var("DATABASE_URL")?;
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;
    println!("Migrations applied successfully.");
    Ok(())
}
