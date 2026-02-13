# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Prerequisites

You need Node.js and MySQL installed on your system.

#### Install Node.js
1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer and follow the prompts
4. Restart PowerShell after installation

#### Install MySQL
1. Go to https://dev.mysql.com/downloads/mysql/
2. Download MySQL Community Server
3. Run the installer
4. Remember the root password you set during installation

### Step 2: Setup Database

Open PowerShell or MySQL Workbench and run:

```bash
mysql -u root -p < database/schema.sql
```

Enter your MySQL root password when prompted.

**Or using MySQL Workbench:**
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open `database/schema.sql`
4. Execute the script

### Step 3: Configure Environment

The `.env` file has been created for you. Edit it with your settings:

```bash
notepad .env
```

**Update these values:**
```env
DB_PASSWORD=your_mysql_password
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

### "Cannot connect to MySQL"
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env` file
- Ensure database exists: `SHOW DATABASES;`

### "Port 3000 already in use"
- Change `PORT=3001` in `.env` file
- Or stop the process using port 3000

### No rates showing
- Database schema not loaded
- Run: `mysql -u root -p < database/schema.sql`

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
