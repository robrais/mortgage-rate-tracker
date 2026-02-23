-- PostgreSQL schema for mortgage_tracker

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Mortgage type check constraint values
-- Only 30 and 15 year fixed rates available from API

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mortgage rates table (cached data from weekly API updates)
CREATE TABLE IF NOT EXISTS mortgage_rates (
  id SERIAL PRIMARY KEY,
  rate_date DATE NOT NULL,
  mortgage_type VARCHAR(20) NOT NULL CHECK (mortgage_type IN ('30_YEAR_FIXED', '15_YEAR_FIXED')),
  rate DECIMAL(5, 3) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (rate_date, mortgage_type)
);

-- User alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  mortgage_type VARCHAR(20) NOT NULL CHECK (mortgage_type IN ('30_YEAR_FIXED', '15_YEAR_FIXED')),
  target_rate DECIMAL(5, 3) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_notified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE OR REPLACE TRIGGER user_alerts_updated_at
  BEFORE UPDATE ON user_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Email notifications log
CREATE TABLE IF NOT EXISTS email_notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  alert_id INT NOT NULL,
  rate DECIMAL(5, 3) NOT NULL,
  mortgage_type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (alert_id) REFERENCES user_alerts(id) ON DELETE CASCADE
);

-- Insert some mock data for rates (will be replaced by real API data)
INSERT INTO mortgage_rates (rate_date, mortgage_type, rate) VALUES
  (CURRENT_DATE, '30_YEAR_FIXED', 6.875),
  (CURRENT_DATE, '15_YEAR_FIXED', 6.125),
  (CURRENT_DATE - INTERVAL '7 days', '30_YEAR_FIXED', 6.920),
  (CURRENT_DATE - INTERVAL '7 days', '15_YEAR_FIXED', 6.180)
ON CONFLICT (rate_date, mortgage_type) DO NOTHING;
