use linch_desktop_core::{LinchDesktopExt, LinchConfig};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let config = LinchConfig::from_env();

    tauri::Builder::default()
        .with_linch_desktop(config)
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
