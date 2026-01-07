use sentry::ClientInitGuard;

/// Initialize Sentry for error reporting
/// DSN is read from VITE_SENTRY_DSN env var at compile time
fn init_sentry() -> Option<ClientInitGuard> {
    // Read DSN from compile-time env var (same as frontend)
    let dsn = option_env!("VITE_SENTRY_DSN")?;

    if dsn.is_empty() {
        return None;
    }

    let guard = sentry::init((dsn, sentry::ClientOptions {
        release: sentry::release_name!(),
        // Only send in release builds
        #[cfg(debug_assertions)]
        sample_rate: 0.0,
        #[cfg(not(debug_assertions))]
        sample_rate: 1.0,
        ..Default::default()
    }));

    Some(guard)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize Sentry first (guard must live for entire app lifetime)
    let _sentry_guard = init_sentry();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                // Devtools are enabled by default in debug builds
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
