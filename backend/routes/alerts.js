const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user's alerts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [alerts] = await pool.query(`
      SELECT id, mortgage_type, target_rate, is_active, last_notified_at, created_at 
      FROM user_alerts 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.userId]);

    res.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Error fetching alerts' });
  }
});

// Create alert
router.post('/', [
  authMiddleware,
  body('mortgage_type').isIn(['30_YEAR_FIXED', '15_YEAR_FIXED', '30_YEAR_ARM', '15_YEAR_ARM']),
  body('target_rate').isFloat({ min: 0, max: 20 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mortgage_type, target_rate } = req.body;

    const [result] = await pool.query(`
      INSERT INTO user_alerts (user_id, mortgage_type, target_rate) 
      VALUES (?, ?, ?)
    `, [req.userId, mortgage_type, target_rate]);

    res.status(201).json({
      message: 'Alert created successfully',
      alert: {
        id: result.insertId,
        mortgage_type,
        target_rate,
        is_active: true
      }
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Error creating alert' });
  }
});

// Update alert
router.put('/:id', [
  authMiddleware,
  body('target_rate').optional().isFloat({ min: 0, max: 20 }),
  body('is_active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { target_rate, is_active } = req.body;

    const updates = [];
    const values = [];

    if (target_rate !== undefined) {
      updates.push('target_rate = ?');
      values.push(target_rate);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    values.push(req.userId, id);

    await pool.query(`
      UPDATE user_alerts 
      SET ${updates.join(', ')} 
      WHERE user_id = ? AND id = ?
    `, values);

    res.json({ message: 'Alert updated successfully' });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Error updating alert' });
  }
});

// Delete alert
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`
      DELETE FROM user_alerts 
      WHERE user_id = ? AND id = ?
    `, [req.userId, id]);

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Error deleting alert' });
  }
});

module.exports = router;
