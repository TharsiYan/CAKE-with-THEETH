#!/usr/bin/env node

/**
 * Cake with THEETH - Startup Script
 * 
 * This script starts both the backend API server and serves the frontend.
 * For production deployment, the frontend is served as static files.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

console.log('🎂 Starting Cake with THEETH...');
console.log(`Mode: ${isDev ? 'Development' : 'Production'}`);

// Start the backend server
const serverPath = path.join(__dirname, 'server', 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error('❌ Server file not found:', serverPath);
  process.exit(1);
}

console.log('📡 Starting API server...');

const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' }
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down...');
  server.kill('SIGTERM');
});
