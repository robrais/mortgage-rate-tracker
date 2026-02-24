# Mortgage Rate Tracker - Setup Instructions

## Prerequisites

1. **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
2. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/) (runs PostgreSQL)

## Installation Steps

### 1. Start PostgreSQL

From the project root, start the database with Docker Compose:

```bash
docker compose up -d
```

This starts a local PostgreSQL instance and applies the schema automatically on first run.

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp ../.env.example .env
```

Edit `.env` and update with your settings:
- `DATABASE_URL` - PostgreSQL connection string (default works with Docker Compose out of the box)
- JWT secret (use a random string)
- `RESEND_API_KEY` and `EMAIL_FROM` for email notifications

```env
DATABASE_URL=postgresql://mortgage_user:mortgage_pass@localhost:5432/mortgage_tracker
JWT_SECRET=change-this-to-a-random-string
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

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

Check the console for any email-related output.

### 4. Update Rates (Simulate API Call)

```bash
curl -X POST http://localhost:3000/api/rates/update
```

This will generate random rates. Then trigger the rate check again to test notifications.

## Notes

- The app uses [Resend](https://resend.com/) for email notifications
- Configure `RESEND_API_KEY` and `EMAIL_FROM` in `.env` for real emails
- The cron job runs daily at 9 AM - modify in `server.js` if needed

## Troubleshooting

### Database Connection Issues
- Verify Docker is running: `docker compose ps`
- Restart the container: `docker compose down; docker compose up -d`
- Check `DATABASE_URL` in `.env` matches the docker-compose defaults

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3000

### Email Not Sending
- Configure `RESEND_API_KEY` and `EMAIL_FROM` in `.env`
- Check console for error messages
