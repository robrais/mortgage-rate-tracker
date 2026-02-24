# Mortgage Rate Tracker

A full-stack web application that tracks mortgage refinance rates and sends email alerts to users when rates fall within their desired range.

## Features

- 📊 **Real-time Rate Display** - View current mortgage rates for different types (30yr Fixed, 15yr Fixed, 30yr ARM, 15yr ARM)
- 🔐 **User Authentication** - Secure email/password registration and login with JWT
- 🎯 **Custom Rate Alerts** - Set target rates for specific mortgage types
- 📧 **Email Notifications** - Automatic email alerts when rates meet your targets
- ⏰ **Daily Monitoring** - Scheduled daily checks for rate changes
- 💾 **PostgreSQL Database** - Structured storage for users, rates, and alerts

## Tech Stack

**Backend:**
- Node.js & Express
- PostgreSQL database with pg
- JWT authentication with bcryptjs
- Nodemailer for email notifications
- node-cron for scheduled tasks

**Frontend:**
- Vanilla JavaScript (no framework dependencies)
- Modern CSS with responsive design
- HTML5

## Project Structure

```
vigilant-octo-giggle/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Registration & login
│   │   ├── rates.js             # Mortgage rates API
│   │   └── alerts.js            # User alerts management
│   ├── services/
│   │   ├── emailService.js      # Email notification service
│   │   └── rateCheckService.js  # Rate monitoring service
│   ├── server.js                # Main Express server
│   └── package.json
├── frontend/
│   ├── index.html               # Landing page with auth
│   ├── dashboard.html           # User dashboard
│   ├── styles.css               # Global styles
│   └── app.js                   # Frontend JavaScript
├── database/
│   └── schema.sql               # Database schema & seed data
├── .env.example                 # Environment variables template
└── SETUP.md                     # Detailed setup instructions
```

## Quick Start

### Prerequisites

- Node.js (v20+)
- Docker Desktop (runs PostgreSQL)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd mortgage-rate-tracker
   ```

2. **Start PostgreSQL via Docker Compose:**
   ```bash
   docker compose up -d
   ```
   The schema is applied automatically on first run.

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables:**
   ```bash
   cp ../.env.example .env
   ```
   
   Edit `.env` with your settings:
   ```
   DATABASE_URL=postgresql://mortgage_user:mortgage_pass@localhost:5432/mortgage_tracker
   JWT_SECRET=change-this-to-a-random-string
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Usage

### 1. Register an Account
- Navigate to http://localhost:3000
- Click "Register" and create an account with your email

### 2. View Current Rates
- Rates are displayed on both the landing page and dashboard
- Mock rates are pre-populated in the database

### 3. Create Rate Alerts
- Log in to access the dashboard
- Select a mortgage type (30yr Fixed, 15yr Fixed, etc.)
- Enter your target rate
- Click "Create Alert"

### 4. Testing Email Notifications

**Simulate rate updates:**
```bash
curl -X POST http://localhost:3000/api/rates/update
```

**Manually trigger rate check:**
```bash
curl -X POST http://localhost:3000/api/admin/check-rates
```

Check the server console for any email-related output.

### 5. Automatic Daily Checks
- The app automatically checks rates daily at 9 AM
- Modify the cron schedule in `backend/server.js` if needed

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Rates
- `GET /api/rates/current` - Get today's rates
- `GET /api/rates/history?days=30` - Get historical rates
- `POST /api/rates/update` - Update rates (mock API)

### Alerts (Protected)
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Admin
- `POST /api/admin/check-rates` - Manually trigger rate check

## Configuration

### Email Setup

Configure email notifications via [Resend](https://resend.com/) in `.env`:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### Database Connection

Update `.env` with your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://mortgage_user:mortgage_pass@localhost:5432/mortgage_tracker
```

## Development

Run with auto-reload:
```bash
cd backend
npm run dev
```

## Future Enhancements

- Integration with real mortgage rate API
- Historical rate charts and analytics
- SMS notifications
- Multiple user notification preferences
- Rate prediction/trends
- Mobile app version

## Troubleshooting

**Database connection errors:**
- Ensure PostgreSQL is running (`docker compose ps`)
- Verify `DATABASE_URL` in `.env` matches docker-compose defaults

**Port 3000 already in use:**
- Change `PORT` in `.env`
- Or stop the conflicting process

**Emails not sending:**
- Configure `RESEND_API_KEY` and `EMAIL_FROM` in `.env`
- Check server console for error messages

## License

MIT

## Contributing

This is a prototype application. Contributions and suggestions are welcome!