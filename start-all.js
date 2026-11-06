import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

console.log('=================================================================');
console.log('   Starting Campus Resource Sharing Prototype (Full Stack)');
console.log('=================================================================');

// 1. Spawn Backend Express Server
const serverDir = path.join(__dirname, 'server');
const serverProcess = spawn('node', ['src/server.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (err) => {
  console.error('[Server Spawn Error]:', err);
});

// 2. Spawn Frontend Vite Server
const clientDir = path.join(__dirname, 'client');
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true
});

clientProcess.on('error', (err) => {
  console.error('[Client Spawn Error]:', err);
});

// Graceful cleanup
function cleanup() {
  console.log('\nStopping Campus Resource Sharing servers...');
  try {
    serverProcess.kill('SIGINT');
  } catch (e) {}
  try {
    clientProcess.kill('SIGINT');
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
