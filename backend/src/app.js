require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startCronJob } = require('./jobs/deleteExpired');

const app = express();

connectDB();

app.use(cors({
  origin: ['http://localhost:5173', 'https://filedrop-frontend.vercel.app'],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/upload', require('./routes/upload'));
app.use('/api/download', require('./routes/download'));

app.use(errorHandler);

app.get('/', (req, res) => res.json({ status: 'FileDrop API running ✅' }));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJob();
});

server.timeout = 300000;