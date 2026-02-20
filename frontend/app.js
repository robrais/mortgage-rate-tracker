const API_URL = '/api';

// Utility functions
function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('active');
    setTimeout(() => errorEl.classList.remove('active'), 5000);
  }
}

function formatMortgageType(type) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Fetch current rates
async function loadCurrentRates() {
  try {
    const response = await fetch(`${API_URL}/rates/current`);
    const data = await response.json();
    
    const ratesContainer = document.getElementById('current-rates');
    
    if (data.rates.length === 0) {
      ratesContainer.innerHTML = '<p class="loading">No rates available</p>';
      return;
    }
    
    ratesContainer.innerHTML = data.rates.map(rate => `
      <div class="rate-card">
        <h3>${formatMortgageType(rate.mortgage_type)}</h3>
        <div class="rate-value">${parseFloat(rate.rate).toFixed(3)}%</div>
        <div class="rate-date">As of ${new Date(rate.rate_date).toLocaleDateString()}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading rates:', error);
    document.getElementById('current-rates').innerHTML = 
      '<p class="loading">Error loading rates</p>';
  }
}

// Auth functionality
if (document.getElementById('login-form')) {
  document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('show-login').classList.add('active');
    document.getElementById('show-register').classList.remove('active');
  });

  document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('show-login').classList.remove('active');
    document.getElementById('show-register').classList.add('active');
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        window.location.href = 'dashboard.html';
      } else {
        showError('login-error', data.error || 'Login failed');
      }
    } catch (error) {
      showError('login-error', 'Network error. Please try again.');
    }
  });

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        window.location.href = 'dashboard.html';
      } else {
        showError('register-error', data.error || 'Registration failed');
      }
    } catch (error) {
      showError('register-error', 'Network error. Please try again.');
    }
  });
}

// Dashboard functionality
if (document.getElementById('alert-form')) {
  // Check authentication
  if (!getToken()) {
    window.location.href = 'index.html';
  }

  // Load user info
  async function loadUserInfo() {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('user-email').textContent = payload.email;
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    removeToken();
    window.location.href = 'index.html';
  });

  // Load alerts
  async function loadAlerts() {
    try {
      const response = await fetch(`${API_URL}/alerts`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      const data = await response.json();
      const alertsList = document.getElementById('alerts-list');
      
      if (data.alerts.length === 0) {
        alertsList.innerHTML = '<p class="loading">No alerts set. Create your first alert above!</p>';
        return;
      }
      
      alertsList.innerHTML = data.alerts.map(alert => `
        <div class="alert-item ${alert.is_active ? '' : 'inactive'}">
          <div class="alert-info">
            <h4>${formatMortgageType(alert.mortgage_type)}</h4>
            <p><strong>Target Rate:</strong> ${parseFloat(alert.target_rate).toFixed(3)}%</p>
            <p><strong>Status:</strong> ${alert.is_active ? 'Active' : 'Inactive'}</p>
            ${alert.last_notified_at ? `<p><strong>Last Notified:</strong> ${new Date(alert.last_notified_at).toLocaleDateString()}</p>` : ''}
          </div>
          <div class="alert-actions">
            <button class="btn ${alert.is_active ? 'btn-secondary' : 'btn-primary'}" 
                    onclick="toggleAlert(${alert.id}, ${!alert.is_active})">
              ${alert.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button class="btn btn-danger" onclick="deleteAlert(${alert.id})">Delete</button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading alerts:', error);
      document.getElementById('alerts-list').innerHTML = 
        '<p class="loading">Error loading alerts</p>';
    }
  }

  // Create alert
  document.getElementById('alert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const mortgageType = document.getElementById('mortgage-type').value;
    const targetRate = document.getElementById('target-rate').value;
    
    try {
      const response = await fetch(`${API_URL}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          mortgage_type: mortgageType,
          target_rate: parseFloat(targetRate)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        document.getElementById('alert-form').reset();
        loadAlerts();
      } else {
        showError('alert-error', data.error || 'Failed to create alert');
      }
    } catch (error) {
      showError('alert-error', 'Network error. Please try again.');
    }
  });

  // Toggle alert
  window.toggleAlert = async function(alertId, isActive) {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ is_active: isActive })
      });
      
      if (response.ok) {
        loadAlerts();
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  // Delete alert
  window.deleteAlert = async function(alertId) {
    if (!confirm('Are you sure you want to delete this alert?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (response.ok) {
        loadAlerts();
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  // Initialize dashboard
  loadUserInfo();
  loadAlerts();
}

// Load current rates on page load
loadCurrentRates();
