# Mortgage Rate Tracker - Setup Instructions

## Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MySQL** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

Start MySQL and run the schema:

```bash
mysql -u root -p < ../database/schema.sql
```

Or manually:
1. Open MySQL Workbench or command line
2. Copy and paste the contents of `database/schema.sql`
3. Execute the SQL

### 3. Configure Environment

Copy the example environment file:

```bash
cp ../.env.example .env
```

Edit `.env` and update with your settings:
- Database credentials
- JWT secret (use a random string)
- SMTP settings (optional - will use test account if empty)

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Testing

### 1. Register an Account
- Go to http://localhost:3000
- Click "Register" and create an account

### 2. Set Up Alerts
- After logging in, you'll see the dashboard
- Create a rate alert by selecting a mortgage type and target rate

### 3. Test Email Notifications

Manually trigger the rate check:

```bash
curl -X POST http://localhost:3000/api/admin/check-rates
```

Check the console for test email URLs (using Ethereal test account).

### 4. Update Rates (Simulate API Call)

```bash
curl -X POST http://localhost:3000/api/rates/update
```

This will generate random rates. Then trigger the rate check again to test notifications.

## Notes

- The app uses Ethereal Email for testing by default (no real emails sent)
- To send real emails, configure SMTP settings in `.env`
- For Gmail, you need to use an "App Password" - [Guide](https://support.google.com/accounts/answer/185833)
- The cron job runs daily at 9 AM - modify in `server.js` if needed

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists: `CREATE DATABASE mortgage_tracker;`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3000

### Email Not Sending
- Check SMTP credentials
- For development, leave SMTP settings empty to use test account
- Check console for test email preview URLs
