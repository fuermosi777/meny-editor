const fs = require('fs');
const path = require('path');

// Define paths relative to the workspace directory
const menyEditorBuildDir = path.join(__dirname, '../build');
const menyProjectDir = path.join(__dirname, '../../Meny/Meny/CM');

// Define file paths
const filesToCopy = [
  { src: path.join(menyEditorBuildDir, 'index.html'), dest: path.join(menyProjectDir, 'index.html') },
  { src: path.join(menyEditorBuildDir, 'main.bundle.css'), dest: path.join(menyProjectDir, 'main.bundle.css') },
  { src: path.join(menyEditorBuildDir, 'main.bundle.js'), dest: path.join(menyProjectDir, 'main.bundle.js') },
];

// Copy files
filesToCopy.forEach(({ src, dest }) => {
  try {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } catch (error) {
    console.error(`Failed to copy ${src} to ${dest}:`, error);
  }
});