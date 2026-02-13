const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get current rates
router.get('/current', async (req, res) => {
  try {
    const [rates] = await pool.query(`
      SELECT mortgage_type, rate, rate_date 
      FROM mortgage_rates 
      WHERE rate_date = CURDATE()
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
    const { days = 30 } = req.query;
    
    const [rates] = await pool.query(`
      SELECT mortgage_type, rate, rate_date 
      FROM mortgage_rates 
      WHERE rate_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY rate_date DESC, mortgage_type
    `, [parseInt(days)]);

    res.json({ rates });
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    res.status(500).json({ error: 'Error fetching historical rates' });
  }
});

// Mock endpoint to update rates (simulates API call)
router.post('/update', async (req, res) => {
  try {
    const mockRates = [
      { type: '30_YEAR_FIXED', rate: (6.5 + Math.random()).toFixed(3) },
      { type: '15_YEAR_FIXED', rate: (5.8 + Math.random()).toFixed(3) },
      { type: '30_YEAR_ARM', rate: (6.0 + Math.random()).toFixed(3) },
      { type: '15_YEAR_ARM', rate: (5.5 + Math.random()).toFixed(3) }
    ];

    for (const mockRate of mockRates) {
      await pool.query(`
        INSERT INTO mortgage_rates (rate_date, mortgage_type, rate) 
        VALUES (CURDATE(), ?, ?)
        ON DUPLICATE KEY UPDATE rate = ?
      `, [mockRate.type, mockRate.rate, mockRate.rate]);
    }

    res.json({ message: 'Rates updated successfully', rates: mockRates });
  } catch (error) {
    console.error('Error updating rates:', error);
    res.status(500).json({ error: 'Error updating rates' });
  }
});

module.exports = router;
