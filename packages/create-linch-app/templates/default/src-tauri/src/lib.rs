use linch_tech_desktop_core::{LinchDesktopExt, LinchConfig};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let config = LinchConfig::from_env();

    tauri::Builder::default()
        .with_linch_desktop(config)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
