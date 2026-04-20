const multer = require('multer');

const storage = multer.memoryStorage(); // file RAM mein temporarily rakhega

const fileFilter = (req, file, cb) => {
    // Sirf dangerous files block karo (.exe, .bat, .sh)
    const blockedTypes = ['application/x-msdownload', 'application/x-sh', 'application/x-bat'];
    if (blockedTypes.includes(file.mimetype)) {
        return cb(new Error('This file type is not allowed'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB max
});

module.exports = upload;