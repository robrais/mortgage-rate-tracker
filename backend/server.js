const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ratesRoutes = require('./routes/rates');
const alertsRoutes = require('./routes/alerts');
const { checkRatesAndNotify } = require('./services/rateCheckService');
const { updateRatesFromAPI } = require('./services/mortgageApiService');

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

// Schedule weekly rate fetch and notification check
// Runs every Friday at 9 AM (Freddie Mac releases rates on Fridays)
cron.schedule('0 9 * * 5', async () => {
  console.log('\n⏰ Running scheduled weekly rate update (Friday 9 AM)...');
  
  const { isDbAvailable } = require('./config/database');
  if (!isDbAvailable()) {
    console.warn('⚠️  Skipping scheduled update — database not available');
    return;
  }

  try {
    // Step 1: Fetch latest rates from API and save to database
    console.log('📊 Step 1: Fetching rates from API...');
    const updateResult = await updateRatesFromAPI();
    
    if (updateResult.success) {
      console.log(`✅ Rates updated: ${updateResult.savedCount} rate(s) saved`);
      
      // Step 2: Check alerts and send notifications
      console.log('📧 Step 2: Checking alerts and sending notifications...');
      await checkRatesAndNotify();
    } else {
      console.error('❌ Failed to update rates:', updateResult.error);
    }
  } catch (error) {
    console.error('❌ Error in scheduled weekly update:', error);
  }
});

// Manual trigger for testing
app.post('/api/admin/check-rates', async (req, res) => {
  const { isDbAvailable } = require('./config/database');
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }
  try {
    const result = await checkRatesAndNotify();
    res.json({ message: 'Rate check completed', result });
  } catch (error) {
    res.status(500).json({ error: 'Error checking rates' });
  }
});

// Manual trigger to fetch rates from API (for testing)
app.post('/api/admin/update-rates', async (req, res) => {
  const { isDbAvailable } = require('./config/database');
  if (!isDbAvailable()) {
    return res.status(503).json({ error: 'Database not available' });
  }
  try {
    const result = await updateRatesFromAPI();
    if (result.success) {
      res.json({ 
        message: 'Rates updated successfully', 
        savedCount: result.savedCount,
        rates: result.rates
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating rates' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access frontend at http://localhost:${PORT}`);
});

// Force Node.js to prefer IPv4 over IPv6 (fixes Render ENETUNREACH)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
