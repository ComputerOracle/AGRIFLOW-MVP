use rand::RngExt;

/// Generates IDs in the same human-readable shape the frontend already uses
/// (e.g. `USR-BUY-4f9a2c`, `TXN-AGF-83021`) so existing seed/demo data and
/// any code that pattern-matches on ID prefixes keeps working.
pub fn generate(prefix: &str) -> String {
    let suffix: u32 = rand::rng().random_range(10_000..99_999);
    format!("{prefix}-{suffix}")
}

pub fn user_id(role: &str) -> String {
    let prefix = match role {
        "buyer" => "USR-BUY",
        "supplier" => "USR-SUP",
        "logistics" => "USR-LOG",
        _ => "USR-ADM",
    };
    generate(prefix)
}
