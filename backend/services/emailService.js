const nodemailer = require('nodemailer');

// Create transporter (configure with your email provider)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// For development, create a test account
async function createTestAccount() {
  if (!process.env.SMTP_USER) {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test email account created:');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
  return transporter;
}

async function sendRateAlert(userEmail, mortgageType, currentRate, targetRate) {
  try {
    const testTransporter = await createTestAccount();
    
    const mortgageTypeName = mortgageType.replace(/_/g, ' ');
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@mortgagetracker.com',
      to: userEmail,
      subject: `Rate Alert: ${mortgageTypeName} at ${currentRate}%`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Mortgage Rate Alert</h2>
          <p>Good news! The rate for <strong>${mortgageTypeName}</strong> has reached your target.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Mortgage Type:</strong> ${mortgageTypeName}</p>
            <p style="margin: 5px 0;"><strong>Current Rate:</strong> <span style="color: #27ae60; font-size: 24px;">${currentRate}%</span></p>
            <p style="margin: 5px 0;"><strong>Your Target:</strong> ${targetRate}%</p>
          </div>
          <p>This is a great opportunity to consider refinancing your mortgage.</p>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            You are receiving this email because you set up a rate alert on Mortgage Rate Tracker.
          </p>
        </div>
      `
    };

    const info = await testTransporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendRateAlert };
