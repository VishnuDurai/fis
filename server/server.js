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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { SREC_ROOT, migrateExistingUploads, findFileInSrecOrUploads } from './utils/fileStorage.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Authentication guard for saved files - redirects unauthorized requests to frontend login
const requireFileAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;
  const clientLoginUrl = process.env.CLIENT_URL || 'http://localhost:5173/login';

  if (!token || isTokenBlacklisted(token)) {
    return res.redirect(clientLoginUrl);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect(clientLoginUrl);
    }
    req.user = user;
    next();
  });
};

// Universal dynamic file resolver for /uploads and /SREC requests
app.use('/uploads', requireFileAuth, (req, res, next) => {
  const urlPath = (req.originalUrl || req.url || '').split('?')[0];
  const filename = path.basename(urlPath);

  if (!filename || filename === 'uploads' || filename === 'document' || filename === 'upload' || filename.includes('..')) {
    return next();
  }

  const filePath = findFileInSrecOrUploads(filename);
  if (filePath && fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  next();
});

app.use('/SREC', requireFileAuth, (req, res, next) => {
  const urlPath = (req.originalUrl || req.url || '').split('?')[0];
  const filename = path.basename(urlPath);

  if (!filename || filename === 'SREC' || filename.includes('..')) {
    return next();
  }

  const filePath = findFileInSrecOrUploads(filename);
  if (filePath && fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  next();
});

// Fallback static servers
app.use('/SREC', requireFileAuth, express.static(SREC_ROOT));
app.use('/uploads', requireFileAuth, express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/dynamic-pages', dynamicPagesRouter);

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

// Start Server
app.listen(PORT, () => {
  console.log(`SREC FIS Backend running on port ${PORT}`);
  try {
    migrateExistingUploads();
  } catch (e) {
    console.error('Initial SREC migration check error:', e.message);
  }
});
