# linch_tech_desktop_core

Tauri v2 extension library for Linch Desktop applications.

## Features

- Tauri plugin integrations (fs, dialog, shell, sql, updater, process, opener)
- Sentry error tracking support
- Common utilities for desktop apps

## Usage

Add to your `Cargo.toml`:

```toml
[dependencies]
linch_tech_desktop_core = "0.1"
```

In your Tauri app's `lib.rs`:

```rust
use linch_tech_desktop_core::run;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    run();
}
```

## License

MIT
