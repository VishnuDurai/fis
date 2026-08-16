import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import authRouter, { JWT_SECRET, isTokenBlacklisted } from './routes/auth.js';
import facultyRouter from './routes/faculty.js';
import activitiesRouter from './routes/activities.js';
import adminRouter from './routes/admin.js';
import dynamicPagesRouter from './routes/dynamic_pages.js';
import analyticsRouter from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { SREC_ROOT, migrateExistingUploads, findFileInSrecOrUploads } from './utils/fileStorage.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Authentication guard for saved files - redirects unauthorized users directly to /login screen
const requireFileAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token || token === 'undefined' || token === 'null' || isTokenBlacklisted(token)) {
    return res.redirect('/login');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect('/login');
    }
    req.user = user;
    next();
  });
};

// Universal dynamic file resolver for /uploads and /SREC requests
app.use('/uploads', requireFileAuth, (req, res, next) => {
  const urlPath = (req.originalUrl || req.url || '').split('?')[0];
  let filename = path.basename(urlPath);
  try { filename = decodeURIComponent(filename); } catch (e) {}

  if (!filename || filename === 'uploads' || filename === 'document' || filename === 'upload' || filename.includes('..')) {
    return next();
  }

  const filePath = findFileInSrecOrUploads(filename);
  if (filePath && fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  return res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head><title>File Not Found - SREC FIS</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
      <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%;">
        <div style="font-size: 48px; margin-bottom: 12px;">📁</div>
        <h2 style="margin: 0 0 8px 0; color: #0f331f; font-size: 1.3rem;">File Not Found</h2>
        <p style="color: #64748b; font-size: 0.9rem; line-height: 1.5; margin-bottom: 24px;">The requested document file could not be located on the server disk. Please re-upload the document.</p>
        <a href="/profile/documents" style="display: inline-block; background: #15583b; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 0.9rem;">Back to Documents</a>
      </div>
    </body>
    </html>
  `);
});

app.use('/SREC', requireFileAuth, (req, res, next) => {
  const urlPath = (req.originalUrl || req.url || '').split('?')[0];
  let filename = path.basename(urlPath);
  try { filename = decodeURIComponent(filename); } catch (e) {}

  if (!filename || filename === 'SREC' || filename.includes('..')) {
    return next();
  }

  const filePath = findFileInSrecOrUploads(filename);
  if (filePath && fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  return res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head><title>File Not Found - SREC FIS</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
      <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%;">
        <div style="font-size: 48px; margin-bottom: 12px;">📁</div>
        <h2 style="margin: 0 0 8px 0; color: #0f331f; font-size: 1.3rem;">File Not Found</h2>
        <p style="color: #64748b; font-size: 0.9rem; line-height: 1.5; margin-bottom: 24px;">The requested document file could not be located on the server disk. Please re-upload the document.</p>
        <a href="/profile/documents" style="display: inline-block; background: #15583b; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 0.9rem;">Back to Documents</a>
      </div>
    </body>
    </html>
  `);
});

// Fallback static servers
app.use('/SREC', requireFileAuth, express.static(SREC_ROOT));
app.use('/uploads', requireFileAuth, express.static(path.join(__dirname, 'uploads')));

import systemPageConfigsRouter from './routes/systemPageConfigs.js';

// Routes
app.use('/api/auth', authRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/dynamic-pages', dynamicPagesRouter);
app.use('/api/system-page-configs', systemPageConfigsRouter);
app.use('/api/analytics', analyticsRouter);

import JSZip from 'jszip';

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Endpoint to compress and download multiple document attachments as a single ZIP file
app.post('/api/utils/download-zip', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token || isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid token' });
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid authentication token' });
    }

    try {
      const { files, zipName } = req.body;
      if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No attachment files provided for ZIP download' });
      }

      const zip = new JSZip();
      let addedCount = 0;

      for (let rawFile of files) {
        if (!rawFile) continue;
        const cleanUrl = String(rawFile).split('?')[0];
        const filename = path.basename(cleanUrl);
        if (!filename || filename === 'null' || filename === 'undefined' || filename === 'N/A') continue;

        const resolvedPath = findFileInSrecOrUploads(filename);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
          const fileBuffer = fs.readFileSync(resolvedPath);
          let entryName = filename;
          let counter = 1;
          while (zip.file(entryName)) {
            const ext = path.extname(filename);
            const base = path.basename(filename, ext);
            entryName = `${base}_${counter}${ext}`;
            counter++;
          }
          zip.file(entryName, fileBuffer);
          addedCount++;
        }
      }

      if (addedCount === 0) {
        return res.status(404).json({ error: 'No physical files found on disk to compress into ZIP archive' });
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      const safeFilename = `${(zipName || 'page_documents').toLowerCase().replace(/[^a-z0-9]/gi, '_')}_attachments.zip`;

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      return res.send(zipBuffer);
    } catch (zipErr) {
      console.error('ZIP generation error:', zipErr);
      return res.status(500).json({ error: 'Server error while generating ZIP archive' });
    }
  });
});

// Fallback static file server for frontend build
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  // Never serve index.html for missing /assets or JS chunks - return 404 so browser invalidates cache
  app.use('/assets', (req, res, next) => {
    const assetPath = path.join(clientDistPath, 'assets', req.path);
    if (!fs.existsSync(assetPath)) {
      return res.status(404).send('Asset not found');
    }
    next();
  });

  app.use(express.static(clientDistPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/SREC') || req.path.startsWith('/health') || req.path.startsWith('/assets')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`SREC FIS Backend running on port ${PORT}`);
  try {
    migrateExistingUploads();
  } catch (e) {
    console.error('Initial SREC migration check error:', e.message);
  }
});
