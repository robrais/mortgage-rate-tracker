const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ratesRoutes = require('./routes/rates');
const alertsRoutes = require('./routes/alerts');
const { checkRatesAndNotify } = require('./services/rateCheckService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/alerts', alertsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Schedule daily rate check (runs at 9 AM every day)
cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled rate check...');
  try {
    await checkRatesAndNotify();
  } catch (error) {
    console.error('Error in scheduled rate check:', error);
  }
});

// Manual trigger for testing (remove in production)
app.post('/api/admin/check-rates', async (req, res) => {
  try {
    const result = await checkRatesAndNotify();
    res.json({ message: 'Rate check completed', result });
  } catch (error) {
    res.status(500).json({ error: 'Error checking rates' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access frontend at http://localhost:${PORT}`);
});
