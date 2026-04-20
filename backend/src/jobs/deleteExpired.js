const cron = require('node-cron');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2');
const File = require('../models/File');

const deleteExpiredFiles = async () => {
  try {
    const expiredFiles = await File.find({ expiresAt: { $lte: new Date() } });

    if (expiredFiles.length === 0) {
      console.log('No expired files found');
      return;
    }

    console.log(`Found ${expiredFiles.length} expired files, deleting...`);

    for (const file of expiredFiles) {
      try {
        await r2Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: file.r2Key,
        }));

        await File.deleteOne({ _id: file._id });
        console.log(`Deleted: ${file.originalName}`);
      } catch (err) {
        console.error(`Failed to delete ${file.originalName}:`, err.message);
      }
    }

  } catch (err) {
    console.error('Cron job error:', err.message);
  }
};

const startCronJob = () => {
  // Har 10 minute mein check karo
  cron.schedule('*/10 * * * *', () => {
    console.log('Running expired files cleanup...');
    deleteExpiredFiles();
  });

  // Server start hote hi ek baar chalao
  deleteExpiredFiles();

  console.log('Cron job started ✅');
};
module.exports = { startCronJob, deleteExpiredFiles };