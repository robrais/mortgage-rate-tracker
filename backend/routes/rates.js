const express = require('express');
const pool = require('../config/database');
const { updateRatesFromAPI } = require('../services/mortgageApiService');

const router = express.Router();

// Get current rates (most recent week)
router.get('/current', async (req, res) => {
  try {
    const [rates] = await pool.query(`
      SELECT mortgage_type, rate, rate_date 
      FROM mortgage_rates 
      WHERE rate_date = (SELECT MAX(rate_date) FROM mortgage_rates)
      ORDER BY mortgage_type
    `);

    res.json({ rates });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Error fetching rates' });
  }
});

// Get historical rates (for date range)
router.get('/history', async (req, res) => {
  try {
    const { weeks = 12 } = req.query; // Changed to weeks instead of days
    
    const [rates] = await pool.query(`
      SELECT mortgage_type, rate, rate_date 
      FROM mortgage_rates 
      WHERE rate_date >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)
      ORDER BY rate_date DESC, mortgage_type
    `, [parseInt(weeks)]);

    res.json({ rates });
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    res.status(500).json({ error: 'Error fetching historical rates' });
  }
});

// Manual endpoint to fetch rates from API (for testing)
router.post('/fetch-now', async (req, res) => {
  try {
    console.log('\n🔄 Manual rate fetch triggered via API...');
    const result = await updateRatesFromAPI();
    
    if (result.success) {
      res.json({ 
        message: 'Rates fetched and saved successfully', 
        savedCount: result.savedCount,
        rates: result.rates
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to update rates', 
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error in fetch-now endpoint:', error);
    res.status(500).json({ error: 'Error updating rates' });
  }
});

// Legacy mock update endpoint (deprecated - use /fetch-now instead)
router.post('/update', async (req, res) => {
  try {
    const mockRates = [
      { type: '30_YEAR_FIXED', rate: (6.5 + Math.random()).toFixed(3) },
      { type: '15_YEAR_FIXED', rate: (5.8 + Math.random()).toFixed(3) }
    ];

    for (const mockRate of mockRates) {
      await pool.query(`
        INSERT INTO mortgage_rates (rate_date, mortgage_type, rate) 
        VALUES (CURDATE(), ?, ?)
        ON DUPLICATE KEY UPDATE rate = ?
      `, [mockRate.type, mockRate.rate, mockRate.rate]);
    }

    res.json({ message: 'Mock rates updated (use /fetch-now for real API)', rates: mockRates });
  } catch (error) {
    console.error('Error updating rates:', error);
    res.status(500).json({ error: 'Error updating rates' });
  }
});

module.exports = router;
