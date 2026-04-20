const express = require('express');
const router = express.Router();
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const bcrypt = require('bcryptjs');
const r2Client = require('../config/r2');
const File = require('../models/File');
const { downloadLimiter } = require('../middleware/rateLimiter');

router.get('/info/:fileId', downloadLimiter, async (req, res) => {
  try {
    const file = await File.findOne({ fileId: req.params.fileId });
    if (!file) return res.status(404).json({ error: 'File not found or expired' });

    // Password query param se aaya toh verify karo
    if (req.query.password !== undefined) {
      if (!file.password) {
        return res.json({ verified: true });
      }
      const isMatch = await bcrypt.compare(req.query.password, file.password);
      if (!isMatch) return res.status(401).json({ error: 'Wrong password' });
      return res.json({ verified: true });
    }

    res.json({
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      expiresAt: file.expiresAt,
      hasPassword: !!file.password,
      downloadCount: file.downloadCount,
      downloadLimit: file.downloadLimit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/file/:fileId', downloadLimiter, async (req, res) => {
  try {
    const file = await File.findOne({ fileId: req.params.fileId });
    if (!file) return res.status(404).json({ error: 'File not found or expired' });

    if (file.downloadLimit && file.downloadCount >= file.downloadLimit) {
      return res.status(403).json({ error: 'Download limit reached' });
    }

    // Password check — query param se aayega
    if (file.password) {
      const pwd = req.query.password || '';
      if (!pwd) return res.status(401).json({ error: 'Password required' });

      const isMatch = await bcrypt.compare(pwd, file.password);
      if (!isMatch) return res.status(401).json({ error: 'Wrong password' });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: file.r2Key,
    });

    const { Body, ContentLength } = await r2Client.send(command);

    await File.updateOne({ fileId: file.fileId }, { $inc: { downloadCount: 1 } });

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    if (ContentLength) res.setHeader('Content-Length', ContentLength);

    Body.pipe(res);

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;