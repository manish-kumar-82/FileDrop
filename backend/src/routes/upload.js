const express = require('express');
const router = express.Router();
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const { Readable } = require('stream');
const r2Client = require('../config/r2');
const File = require('../models/File');
const { uploadLimiter } = require('../middleware/rateLimiter');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5gb
}).single('file');

router.post('/', uploadLimiter, (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const { file } = req;
      if (!file) return res.status(400).json({ error: 'No file uploaded' });

      const fileId = nanoid(8);
      const r2Key = `uploads/${fileId}-${file.originalname}`;
      const expireHours = parseInt(req.body.expireHours) || 24;
      const expiresAt = new Date(Date.now() + expireHours * 60 * 60 * 1000);

      let hashedPassword = null;
      if (req.body.password) {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
      }

      console.log(`Uploading ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);

      const stream = Readable.from(file.buffer);

      await r2Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: r2Key,
        Body: stream,
        ContentType: file.mimetype,
        ContentLength: file.buffer.byteLength,
        ContentDisposition: `attachment; filename="${encodeURIComponent(file.originalname)}"`,
      }));

      console.log('Upload to Backblaze successful!');

      const savedFile = await File.create({
        fileId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        r2Key,
        password: hashedPassword,
        downloadLimit: req.body.downloadLimit ? parseInt(req.body.downloadLimit) : null,
        expiresAt,
      });

      console.log('File saved in MongoDB:', savedFile.fileId, savedFile.originalName);

      res.status(201).json({
        success: true,
        fileId,
        shareUrl: `${process.env.FRONTEND_URL}/download/${fileId}`,
        expiresAt,
      });

    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: err.message });
    }
  });
});

module.exports = router;