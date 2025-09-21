const fs = require('fs');
const path = require('path');

// Paths
const buildDir = path.join(__dirname, '../build');
const indexPath = path.join(buildDir, 'index.html');

// Read and modify index.html
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Update CSS and JS hrefs
indexHtml = indexHtml
  .replace(/\.\/static\/css\/main\.[a-z0-9]+\.css/, './main.bundle.css')
  .replace(/\.\/static\/js\/main\.[a-z0-9]+\.js/, './main.bundle.js');

// Remove logo, manifest, and favicon links
indexHtml = indexHtml
  .replace(/<link rel="apple-touch-icon".*?\/>/, '')
  .replace(/<link rel="manifest".*?\/>/, '')
  .replace(/<link rel="icon".*?\/>/, '');

// Write the modified index.html back
fs.writeFileSync(indexPath, indexHtml, 'utf8');

// Move and rename CSS and JS files
const staticDir = path.join(buildDir, 'static');
const cssDir = path.join(staticDir, 'css');
const jsDir = path.join(staticDir, 'js');

// Find and rename CSS file
const cssFiles = fs.readdirSync(cssDir);
cssFiles.forEach((file) => {
  if (file.startsWith('main.') && file.endsWith('.css')) {
    fs.renameSync(path.join(cssDir, file), path.join(buildDir, 'main.bundle.css'));
  }
});

// Find and rename JS file
const jsFiles = fs.readdirSync(jsDir);
jsFiles.forEach((file) => {
  if (file.startsWith('main.') && file.endsWith('.js')) {
    fs.renameSync(path.join(jsDir, file), path.join(buildDir, 'main.bundle.js'));
  }
});

// Remove empty directories
fs.rmdirSync(cssDir, { recursive: true });
fs.rmdirSync(jsDir, { recursive: true });
fs.rmdirSync(staticDir, { recursive: true });

console.log('Post-build modifications complete.');