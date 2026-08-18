import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Standardizes a faculty profile picture's background to white (#FFFFFF) by default.
 * Uses AI portrait segmentation (rembg) with Pillow fallback.
 * 
 * @param {string} filePath Absolute or relative path to the uploaded image file
 * @param {string} [bgColor='#ffffff'] Hex color code for the background (default: #ffffff)
 * @returns {Promise<{ success: boolean, processed?: boolean, error?: string, path: string }>}
 */
export function standardizeProfilePic(filePath, bgColor = '#ffffff') {
  return new Promise((resolve) => {
    if (!filePath || !fs.existsSync(filePath)) {
      return resolve({ success: false, error: 'Target image file not found on disk', path: filePath });
    }

    const scriptPath = path.resolve(__dirname, '../../scripts/process_profile_picture.py');
    const pythonProc = spawn('python3', [scriptPath, filePath, filePath, bgColor]);

    let stdout = '';
    let stderr = '';

    pythonProc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    pythonProc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    pythonProc.on('close', (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch (e) {
          resolve({ success: true, path: filePath, processed: true });
        }
      } else {
        console.warn('[processProfilePic] Image background processor exited with code', code, stderr);
        // Even on non-zero exit, if file exists, don't break the user experience
        resolve({ success: true, path: filePath, processed: false, warning: stderr });
      }
    });

    pythonProc.on('error', (err) => {
      console.error('[processProfilePic] Failed to spawn python processor:', err.message);
      resolve({ success: true, path: filePath, processed: false, warning: err.message });
    });
  });
}
