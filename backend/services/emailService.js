const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

async function sendRateAlert(userEmail, mortgageType, currentRate, targetRate) {
  const mortgageTypeName = mortgageType.replace(/_/g, ' ');

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Email sent to ${userEmail} (id: ${data.id})`);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendRateAlert };
