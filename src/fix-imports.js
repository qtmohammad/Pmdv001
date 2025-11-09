#!/usr/bin/env node

/**
 * Script to fix version numbers in import statements
 * This script removes version numbers from all imports
 * Example: "package@1.2.3" -> "package"
 */

const fs = require('fs');
const path = require('path');

// List of file patterns to process
const fileExtensions = ['.tsx', '.ts', '.jsx', '.js'];

// Directories to scan
const directoriesToScan = [
  './components',
  './contexts',
  './lib',
  './src'
];

// Counter for tracking changes
let filesProcessed = 0;
let filesChanged = 0;

/**
 * Remove version numbers from import statements
 * @param {string} content - File content
 * @returns {string} - Cleaned content
 */
function removeVersionNumbers(content) {
  // Pattern to match imports with version numbers
  // Matches: "package@1.2.3" or 'package@1.2.3'
  const versionPattern = /(['"])([^'"]+)@\d+\.\d+\.\d+(['"])/g;
  
  // Replace with just the package name
  return content.replace(versionPattern, '$1$2$3');
}

/**
 * Process a single file
 * @param {string} filePath - Path to the file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanedContent = removeVersionNumbers(content);
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      filesChanged++;
    }
    
    filesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively scan directory and process files
 * @param {string} dir - Directory to scan
 */
function scanDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (item !== 'node_modules' && item !== '.git' && item !== 'dist') {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        // Process files with matching extensions
        const ext = path.extname(item);
        if (fileExtensions.includes(ext)) {
          processFile(fullPath);
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
  }
}

// Main execution
console.log('🚀 Starting import fixes...\n');

directoriesToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning: ${dir}`);
    scanDirectory(dir);
  }
});

console.log('\n✨ Done!');
console.log(`📊 Files processed: ${filesProcessed}`);
console.log(`✅ Files changed: ${filesChanged}`);
console.log(`📋 Files unchanged: ${filesProcessed - filesChanged}`);
