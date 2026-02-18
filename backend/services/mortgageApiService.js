const axios = require('axios');
const pool = require('../config/database');
require('dotenv').config();

/**
 * Fetch the latest mortgage rates from API Ninjas
 * @returns {Promise<Object>} { success: boolean, data: Array, error: string }
 */
async function fetchLatestRates() {
  try {
    const apiUrl = process.env.MORTGAGE_API_URL || 'https://api.api-ninjas.com/v1/mortgagerate';
    const apiKey = process.env.MORTGAGE_API_KEY;

    if (!apiKey) {
      console.error('❌ MORTGAGE_API_KEY not configured in .env file');
      return { success: false, error: 'API key not configured' };
    }

    console.log('📡 Fetching mortgage rates from API...');
    
    const response = await axios.get(apiUrl, {
      headers: {
        'X-Api-Key': apiKey
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.data || !Array.isArray(response.data)) {
      console.error('❌ Invalid API response format');
      return { success: false, error: 'Invalid API response format' };
    }

    console.log('✅ Successfully fetched rates from API');
    return { success: true, data: response.data };

  } catch (error) {
    console.error('❌ Error fetching mortgage rates:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Map API field names to database mortgage types
 * @param {string} apiFieldName - Field name from API (e.g., 'frm_30', 'frm_15')
 * @returns {string} Database mortgage type (e.g., '30_YEAR_FIXED')
 */
function mapMortgageType(apiFieldName) {
  const mapping = {
    'frm_30': '30_YEAR_FIXED',
    'frm_15': '15_YEAR_FIXED'
  };
  return mapping[apiFieldName] || null;
}

/**
 * Save mortgage rates to the database
 * @param {Array} apiData - Raw data from API
 * @returns {Promise<Object>} { success: boolean, savedCount: number, error: string }
 */
async function saveRatesToDatabase(apiData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let savedCount = 0;

    for (const weekData of apiData) {
      if (!weekData.data) continue;

      const weekDate = weekData.data.week;
      const rates = weekData.data;

      // Process 30-year fixed rate
      if (rates.frm_30) {
        const mortgageType = mapMortgageType('frm_30');
        const rate = parseFloat(rates.frm_30);
        
        await client.query(
          `INSERT INTO mortgage_rates (rate_date, mortgage_type, rate) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (rate_date, mortgage_type) DO UPDATE SET rate = EXCLUDED.rate`,
          [weekDate, mortgageType, rate]
        );
        savedCount++;
        console.log(`💾 Saved ${mortgageType}: ${rate}% for ${weekDate}`);
      }

      // Process 15-year fixed rate
      if (rates.frm_15) {
        const mortgageType = mapMortgageType('frm_15');
        const rate = parseFloat(rates.frm_15);
        
        await client.query(
          `INSERT INTO mortgage_rates (rate_date, mortgage_type, rate) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (rate_date, mortgage_type) DO UPDATE SET rate = EXCLUDED.rate`,
          [weekDate, mortgageType, rate]
        );
        savedCount++;
        console.log(`💾 Saved ${mortgageType}: ${rate}% for ${weekDate}`);
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Successfully saved ${savedCount} rate(s) to database`);
    
    return { success: true, savedCount };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error saving rates to database:', error.message);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Fetch rates from API and save to database (main function)
 * @returns {Promise<Object>} { success: boolean, rates: Array, savedCount: number, error: string }
 */
async function updateRatesFromAPI() {
  console.log('\n🔄 Starting weekly mortgage rate update...');
  
  // Fetch from API
  const fetchResult = await fetchLatestRates();
  if (!fetchResult.success) {
    return { success: false, error: fetchResult.error };
  }

  // Save to database
  const saveResult = await saveRatesToDatabase(fetchResult.data);
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  console.log('✅ Mortgage rate update completed successfully\n');
  
  return {
    success: true,
    rates: fetchResult.data,
    savedCount: saveResult.savedCount
  };
}

module.exports = {
  fetchLatestRates,
  saveRatesToDatabase,
  updateRatesFromAPI
};
