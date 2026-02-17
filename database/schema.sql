CREATE DATABASE IF NOT EXISTS mortgage_tracker;
USE mortgage_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mortgage rates table (cached data from weekly API updates)
-- Note: Only 30 and 15 year fixed rates available from API
CREATE TABLE IF NOT EXISTS mortgage_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rate_date DATE NOT NULL,
  mortgage_type ENUM('30_YEAR_FIXED', '15_YEAR_FIXED') NOT NULL,
  rate DECIMAL(5, 3) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_rate (rate_date, mortgage_type)
);

-- User alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  mortgage_type ENUM('30_YEAR_FIXED', '15_YEAR_FIXED') NOT NULL,
  target_rate DECIMAL(5, 3) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_notified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email notifications log
CREATE TABLE IF NOT EXISTS email_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
  (CURDATE(), '30_YEAR_FIXED', 6.875),
  (CURDATE(), '15_YEAR_FIXED', 6.125),
  (DATE_SUB(CURDATE(), INTERVAL 7 DAY), '30_YEAR_FIXED', 6.920),
  (DATE_SUB(CURDATE(), INTERVAL 7 DAY), '15_YEAR_FIXED', 6.180);
