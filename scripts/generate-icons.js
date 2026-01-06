import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const iconsDir = path.join(rootDir, 'src-tauri', 'icons');

// Target sizes for Tauri
const sizes = [32, 128];
const targetFiles = [
  { size: 32, name: '32x32.png' },
  { size: 128, name: '128x128.png' },
  { size: 128, name: '128x128@2x.png', density: 2 }, // 256px
  { size: 512, name: 'icon.png' },
];

async function generateIcons(svgPath) {
  if (!fs.existsSync(svgPath)) {
    console.error(`❌ File not found: ${svgPath}`);
    process.exit(1);
  }

  console.log(`🎨 Generating icons from ${svgPath}...`);

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  try {
    // 1. Generate PNGs
    for (const target of targetFiles) {
      const size = target.size * (target.density || 1);
      const outputPath = path.join(iconsDir, target.name);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${target.name} (${size}x${size})`);
    }

    // 2. Generate ICO (combining 32x32 and 128x128)
    const buf32 = await sharp(svgPath).resize(32, 32).png().toBuffer();
    const buf256 = await sharp(svgPath).resize(256, 256).png().toBuffer(); // Standard ICO size
    
    const icoBuf = await pngToIco([buf32, buf256]);
    fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuf);
    console.log(`✅ Generated icon.ico`);

    // 3. Generate ICNS (Optional, requires external tools usually, but we can copy icon.png as placeholder or use specific lib if strictly needed)
    // For now, Tauri v2's `tauri icon` command is best for ICNS, but let's at least provide a high-res png that can be manually converted if needed.
    // Actually, let's just use the 512px icon as the source for 'icon.icns' if we had a library, but ICNS structure is complex.
    // Strategy: We warn the user that for full ICNS support (macOS), they might want to use `pnpm tauri icon` if they have the CLI installed globally, 
    // but our script covers Windows (ICO) and Linux/Web (PNGs).
    
    console.log(`\n🎉 Icons generated in src-tauri/icons/`);
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

const svgFile = process.argv[2];
if (!svgFile) {
  console.log('Usage: node scripts/generate-icons.js <path-to-svg>');
  process.exit(0);
}

generateIcons(svgFile);
