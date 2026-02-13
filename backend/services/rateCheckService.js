const pool = require('../config/database');
const { sendRateAlert } = require('./emailService');

async function checkRatesAndNotify() {
  console.log('Checking rates for notifications...');
  
  try {
    // Get all active alerts with current rates
    const [alerts] = await pool.query(`
      SELECT 
        ua.id as alert_id,
        ua.user_id,
        ua.mortgage_type,
        ua.target_rate,
        ua.last_notified_at,
        u.email,
        mr.rate as current_rate
      FROM user_alerts ua
      JOIN users u ON ua.user_id = u.id
      JOIN mortgage_rates mr ON mr.mortgage_type = ua.mortgage_type 
        AND mr.rate_date = CURDATE()
      WHERE ua.is_active = TRUE
        AND mr.rate <= ua.target_rate
        AND (ua.last_notified_at IS NULL 
          OR ua.last_notified_at < CURDATE())
    `);

    console.log(`Found ${alerts.length} alerts to process`);

    for (const alert of alerts) {
      try {
        // Send email
        await sendRateAlert(
          alert.email,
          alert.mortgage_type,
          alert.current_rate,
          alert.target_rate
        );

        // Update last_notified_at
        await pool.query(`
          UPDATE user_alerts 
          SET last_notified_at = NOW() 
          WHERE id = ?
        `, [alert.alert_id]);

        // Log notification
        await pool.query(`
          INSERT INTO email_notifications (user_id, alert_id, rate, mortgage_type)
          VALUES (?, ?, ?, ?)
        `, [alert.user_id, alert.alert_id, alert.current_rate, alert.mortgage_type]);

        console.log(`Notification sent to ${alert.email} for ${alert.mortgage_type}`);
      } catch (error) {
        console.error(`Error processing alert ${alert.alert_id}:`, error);
      }
    }

    return { processed: alerts.length };
  } catch (error) {
    console.error('Error in checkRatesAndNotify:', error);
    throw error;
  }
}

module.exports = { checkRatesAndNotify };
