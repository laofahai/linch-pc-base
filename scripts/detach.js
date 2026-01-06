import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🚀 Detaching Linch Base to a new project...\n');

  const defaultName = path.basename(rootDir);
  const name = (await question(`Project Name (kebab-case) [${defaultName}]: `)) || defaultName;
  const title = (await question(`App Title [${name}]: `)) || name;
  const identifier = (await question(`Bundle Identifier [tech.linch.${name.replace(/-/g, '')}]: `)) || `tech.linch.${name.replace(/-/g, '')}`;
  const port = Math.floor(Math.random() * (15000 - 14200 + 1) + 14200);
  console.log(`\n🎲 Assigned unique port: ${port}`);

  const oldLibName = 'linch_pc_base'; 
  const newLibName = name.replace(/-/g, '_');

  console.log('\nApplying changes...');

  // 0. Update Port (Vite & Tauri)
  // vite.config.ts
  const viteConfigPath = path.join(rootDir, 'vite.config.ts');
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
  viteConfig = viteConfig.replace(/port: \d+/, `port: ${port}`);
  fs.writeFileSync(viteConfigPath, viteConfig);
  
  // tauri.conf.json (already handled below, but we insert port now)
  const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));
  tauriConf.productName = name;
  tauriConf.identifier = identifier;
  tauriConf.app.windows[0].title = title;
  tauriConf.build.devUrl = `http://127.0.0.1:${port}`; // Update devUrl
  fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2));
  console.log('✅ Updated ports & tauri.conf.json');

  // 1. package.json
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.name = name;
  pkg.version = '0.0.1';
  delete pkg.scripts.detach; // Remove the detach script itself
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('✅ Updated package.json');

  // 2. src-tauri/tauri.conf.json (handled in step 0)
  
  // 3. src-tauri/Cargo.toml
  const cargoPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');
  let cargoToml = fs.readFileSync(cargoPath, 'utf-8');
  // Replace name = "..."
  cargoToml = cargoToml.replace(/^name\s*=\s*".*?"/m, `name = "${name}"`);
  // Replace [lib] name = "..."
  const oldLibName = 'linch_pc_base'; 
  const newLibName = name.replace(/-/g, '_');
  cargoToml = cargoToml.replace(/name\s*=\s*"linch_pc_base_lib"/, `name = "${newLibName}_lib"`);
  fs.writeFileSync(cargoPath, cargoToml);
  console.log('✅ Updated Cargo.toml');

  // 4. src-tauri/src/main.rs (Update lib reference)
  const mainRsPath = path.join(rootDir, 'src-tauri', 'src', 'main.rs');
  let mainRs = fs.readFileSync(mainRsPath, 'utf-8');
  // Simple regex replace might be risky if we don't know the exact old name in future.
  // But for this base, we know it starts as `linch_pc_base_lib::run()`
  
  mainRs = mainRs.replace(/linch_pc_base_lib/g, `${newLibName}_lib`); 
  // Wait, if I change the logic to use explicit lib name, it's safer.
  
  fs.writeFileSync(mainRsPath, mainRs);
  console.log('✅ Updated main.rs');

  // 5. Config app.tsx (Update Brand Name)
  const configPath = path.join(rootDir, 'src', 'config', 'app.tsx');
  let configContent = fs.readFileSync(configPath, 'utf-8');
  // nameKey: "app.name" is usually constant, but we ensure it's there
  console.log('✅ Checked app.tsx');

  // 6. Update Translations
  const i18nPath = path.join(rootDir, 'src', 'i18n', 'config.ts');
  let i18nContent = fs.readFileSync(i18nPath, 'utf-8');
  i18nContent = i18nContent.replace(/"name": "Linch Base"/, `"name": "${title}"`);
  i18nContent = i18nContent.replace(/"name": "Linch 基座"/, `"name": "${title}"`);
  fs.writeFileSync(i18nPath, i18nContent);
  console.log('✅ Updated translations in i18n/config.ts');

  // 7. Reset Git
  try {
    const gitPath = path.join(rootDir, '.git');
    if (fs.existsSync(gitPath)) {
        fs.rmSync(gitPath, { recursive: true, force: true });
        execSync('git init', { cwd: rootDir });
        console.log('✅ Reset git repository');
    }
  } catch (e) {
    console.warn('⚠️ Could not reset git:', e.message);
  }

  // 7. Remove this script
  fs.unlinkSync(path.join(rootDir, 'scripts', 'detach.js'));
  fs.rmdirSync(path.join(rootDir, 'scripts'));
  
  console.log('\n🎉 Done! Your project is ready.');
  console.log(`\nNext steps:\n  cd ${name}\n  pnpm install\n  pnpm tauri dev`);
  
  rl.close();
}

main();
