# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Prerequisites

You need **Node.js** and **Docker Desktop** installed on your system.

#### Install Node.js
1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer and follow the prompts
4. Restart PowerShell after installation

#### Install Docker Desktop
1. Go to https://www.docker.com/products/docker-desktop/
2. Download and install Docker Desktop
3. Start Docker Desktop and wait for it to be ready

### Step 2: Start PostgreSQL

From the project root, run:

```bash
docker compose up -d
```

This starts a local PostgreSQL database. The schema is applied automatically on first run.

To verify it's running:
```bash
docker compose ps
```

### Step 3: Configure Environment

The `.env` file has been created for you. Edit it with your settings:

```bash
notepad .env
```

**The default DATABASE_URL works with Docker Compose out of the box:**
```env
DATABASE_URL=postgresql://mortgage_user:mortgage_pass@localhost:5432/mortgage_tracker
```

**Update these values:**
```env
JWT_SECRET=change-this-to-any-random-string
```

**Leave empty for testing (uses mock email):**
```env
SMTP_USER=
SMTP_PASS=
```

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

### Step 5: Start the Server

From the project root:

```bash
.\start.ps1
```

Or manually:

```bash
cd backend
npm start
```

### Step 6: Access the App

Open your browser and go to:
```
http://localhost:3000
```

## ✅ Quick Test

1. **Register** - Create an account on the landing page
2. **Login** - You'll be redirected to the dashboard
3. **View Rates** - See current mortgage rates
4. **Create Alert** - Set a rate alert (try 7.000% to test)
5. **Test Email** - Run in a new PowerShell window:
   ```bash
   curl -X POST http://localhost:3000/api/admin/check-rates
   ```
6. **Check Console** - Look for email preview URL in server console

## 🔧 Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Install Node.js and restart PowerShell

### "Cannot connect to PostgreSQL"
- Verify Docker is running: `docker compose ps`
- Restart the container: `docker compose down; docker compose up -d`
- Check DATABASE_URL in `.env` matches the docker-compose defaults

### "Port 3000 already in use"
- Change `PORT=3001` in `.env` file
- Or stop the process using port 3000

### No rates showing
- Database schema not loaded. Reset the container:
  ```bash
  docker compose down -v
  docker compose up -d
  ```

## 📚 Next Steps

- Read [SETUP.md](SETUP.md) for detailed documentation
- Review [README.md](README.md) for API endpoints
- Check backend console for email preview URLs
- Modify cron schedule in `backend/server.js` for different check times

## 🎯 Testing the Full Workflow

1. **Update rates** (simulates API call):
   ```bash
   curl -X POST http://localhost:3000/api/rates/update
   ```

2. **Create an alert** with a high target rate (e.g., 8.000%)

3. **Trigger rate check**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/check-rates
   ```

4. **Check server console** for email preview URL

5. **Visit the URL** to see the notification email

## Need Help?

- Check the server console for detailed error messages
- Review `.env` file for correct configuration
- Ensure all prerequisites are properly installed
- Read the detailed [SETUP.md](SETUP.md) guide
