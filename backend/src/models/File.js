const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileId: { type: String, required: true, unique: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    r2Key: { type: String, required: true },
    password: { type: String, default: null },
    downloadLimit: { type: Number, default: null },
    downloadCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true}, // TTL index!
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', fileSchema);